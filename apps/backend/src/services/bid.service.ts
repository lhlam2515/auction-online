import type { BidWithUser, ProductStatus } from "@repo/shared-types";
import { eq, desc, and, ne } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { bids, autoBids, products, users } from "@/models";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";
import { maskName } from "@/utils/ultils";

import { emailService } from "./email.service";
import { orderService } from "./order.service";
import { productService } from "./product.service";
import { systemService } from "./system.service";
import { userService } from "./user.service";

export class BidService {
  async getHistory(productId: string): Promise<BidWithUser[]> {
    await productService.getById(productId); // Ensure product exists

    const productBids = await db
      .select({
        id: bids.id,
        productId: bids.productId,
        userId: bids.userId,
        amount: bids.amount,
        status: bids.status,
        isAuto: bids.isAuto,
        createdAt: bids.createdAt,
        userName: users.fullName,
        ratingScore: users.ratingScore,
      })
      .from(bids)
      .leftJoin(users, eq(bids.userId, users.id))
      .where(and(eq(bids.productId, productId), eq(bids.status, "VALID")))
      .orderBy(desc(bids.amount));

    return productBids.map((bid) => {
      return {
        ...bid,
        userName: maskName(bid.userName || "****"),
        ratingScore: bid.ratingScore ?? 0,
      };
    });
  }

  async getAutoBid(productId: string, userId: string) {
    const autoBid = await db.query.autoBids.findFirst({
      where: and(
        eq(autoBids.productId, productId),
        eq(autoBids.userId, userId)
      ),
    });
    if (!autoBid) {
      throw new NotFoundError("Không tìm thấy cấu hình đấu giá tự động");
    }
    return autoBid;
  }

  async placeBid(
    productId: string,
    bidderId: string,
    amount: number,
    isAuto: boolean = false,
    inputTx?: unknown
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const executeLogic = async (tx: any) => {
      // ---------------------------------------------------------
      // 1. LOCKING: Dùng select().for('update') thay vì query.findFirst
      // ---------------------------------------------------------
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        // Join các bảng liên quan nếu cần thiết (hoặc query riêng nếu Drizzle select join phức tạp)
        // Ở đây giả sử bạn query seller/winner email ở bước sau hoặc join manual
        .for("update");

      if (!product) throw new NotFoundError("Sản phẩm không tồn tại");

      // Lấy thông tin phụ (Email) - Không cần lock bảng User, chỉ cần lock Product là đủ an toàn
      const productDetails = await tx.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          seller: { columns: { email: true } },
          winner: { columns: { email: true } },
        },
      });
      const sellerEmail = productDetails?.seller?.email || "";
      const previousWinnerEmail = productDetails?.winner?.email || "";

      // ---------------------------------------------------------
      // 2. VALIDATION CƠ BẢN
      // ---------------------------------------------------------
      if (product.sellerId === bidderId) {
        throw new BadRequestError(
          "Không thể tự đấu giá sản phẩm của chính mình"
        );
      }
      if (product.status !== "ACTIVE") {
        throw new BadRequestError("Phiên đấu giá không khả dụng");
      }

      const now = new Date();
      if (product.startTime > now)
        throw new BadRequestError("Phiên đấu giá chưa bắt đầu");
      if (product.endTime < now)
        throw new BadRequestError("Phiên đấu giá đã kết thúc");

      // Sử dụng Number() hoặc thư viện Decimal để nhất quán
      const currentPrice = Number(product.currentPrice || product.startPrice);
      const stepPrice = Number(product.stepPrice);

      // Tính Min Bid
      // Nếu chưa có winner: Min = StartPrice
      // Nếu đã có winner: Min = Current + Step
      const minBidAmount = !product.winnerId
        ? currentPrice
        : currentPrice + stepPrice;

      // ---------------------------------------------------------
      // 3. LOGIC NGĂN CHẶN SPAM GIÁ (Khi đang thắng)
      // ---------------------------------------------------------
      if (product.winnerId === bidderId) {
        // Logic: Người thắng chỉ được bid tiếp nếu có AutoBid ẩn của đối thủ cao hơn giá hiện tại
        // (Tức là hệ thống đang "ép" giá lên nhưng chưa vượt qua người thắng hiện tại)

        // Query này an toàn vì Product đã bị Lock, không ai có thể insert/update AutoBid lúc này
        const higherAutoBids = await tx.query.autoBids.findMany({
          where: and(
            eq(autoBids.productId, productId),
            eq(autoBids.isActive, true),
            ne(autoBids.userId, bidderId)
          ),
        });

        const hasHigherAutoBid = higherAutoBids.some(
          // @ts-expect-error - db store numeric as string/decimal
          (autobid) => Number(autobid.maxAmount) > currentPrice
        );

        // Nếu không có áp lực từ đối thủ, chặn việc tự nâng giá (để tránh user tự hại mình)
        if (!hasHigherAutoBid) {
          // Tuy nhiên, nếu đây là AutoBid (isAuto=true) chạy đè lên thì cho phép (trường hợp update max bid)
          // Nhưng ở hàm placeBid này thường là "Hard Bid", nên throw là đúng.
          throw new Error(
            "Bạn đang dẫn đầu, không thể tự nâng giá nếu không có cạnh tranh."
          );
        }
      }

      if (amount < minBidAmount) {
        throw new BadRequestError(`Giá đặt phải tối thiểu là ${minBidAmount}`);
      }

      // ---------------------------------------------------------
      // 4. THỰC HIỆN BID & CẬP NHẬT
      // ---------------------------------------------------------
      const [newBid] = await tx
        .insert(bids)
        .values({
          productId: productId,
          userId: bidderId,
          amount: amount.toString(),
          isAuto,
          createdAt: new Date(),
        })
        .returning();

      // Check Buy Now
      let newStatus = "ACTIVE";
      const buyNowPrice = product.buyNowPrice
        ? Number(product.buyNowPrice)
        : null;

      if (buyNowPrice && amount >= buyNowPrice) {
        newStatus = "SOLD";
      }

      // Update Product
      const [updatedProduct] = await tx
        .update(products)
        .set({
          currentPrice: amount.toString(),
          winnerId: bidderId,
          status: newStatus as ProductStatus, // ACTIVE hoặc SOLD
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      // Xử lý khi SOLD (Mua ngay)
      if (newStatus === "SOLD") {
        await tx
          .update(autoBids)
          .set({ isActive: false, updatedAt: new Date() })
          .where(
            and(eq(autoBids.productId, productId), eq(autoBids.isActive, true))
          );

        await orderService.createFromAuction(
          productId,
          bidderId,
          product.sellerId,
          amount,
          true, // isBuyNow = true
          tx
        );
      }

      // ---------------------------------------------------------
      // 5. AUTO-EXTEND (ANTI-SNIPING)
      // ---------------------------------------------------------
      const oldEndTime = new Date(product.endTime);
      let extendedEndTime: Date | null = null;
      if (newStatus === "ACTIVE" && product.isAutoExtend) {
        // Config nên cache hoặc lấy cứng để đỡ query DB
        const { thresholdMinutes, durationMinutes } =
          await this.getAutoExtendConfig();

        const productEnd = new Date(product.endTime);
        const timeLeftMs = productEnd.getTime() - now.getTime();
        const thresholdMs = thresholdMinutes * 60 * 1000;

        // Chỉ gia hạn nếu thời gian còn lại nhỏ hơn ngưỡng (ví dụ còn 5 phút)
        if (timeLeftMs > 0 && timeLeftMs <= thresholdMs) {
          const newEndTime = new Date(
            productEnd.getTime() + durationMinutes * 60 * 1000
          );
          extendedEndTime = newEndTime;

          await tx
            .update(products)
            .set({ endTime: newEndTime, updatedAt: new Date() })
            .where(eq(products.id, productId));
        }
      }

      return {
        newBid,
        product: updatedProduct,
        sellerEmail,
        previousWinnerEmail,
        isBuyNow: newStatus === "SOLD",
        oldEndTime,
        extendedEndTime,
      };
    };

    // --- THỰC THI TRANSACTION ---
    const result = inputTx
      ? await executeLogic(inputTx)
      : await db.transaction(executeLogic);

    // --- LOGIC SAU KHI COMMIT TRANSACTION (Non-blocking) ---

    // 1. Reschedule job kết thúc đấu giá (nếu có gia hạn)
    if (result.extendedEndTime) {
      await systemService.rescheduleAuctionEnd(
        productId,
        result.product.result.oldEndTime,
        result.extendedEndTime
      );
    }

    // 2. Kích hoạt Auto-Bid Check
    // [QUAN TRỌNG]: Chỉ trigger nếu KHÔNG PHẢI là Buy Now VÀ KHÔNG PHẢI do AutoBid gọi
    if (!result.isBuyNow && !isAuto) {
      await systemService.triggerAutoBidCheck(productId);
    }

    // 3. Gửi Email (Bọc try-catch để không làm fail API response nếu mail server lỗi)
    try {
      const bidder = await userService.getById(bidderId);

      // Gửi cho Seller
      emailService.notifySellerNewBid(
        result.sellerEmail,
        result.product.name,
        amount,
        bidder.fullName,
        productService.buildProductLink(productId)
      );

      // Gửi cho người bid (Xác nhận thành công)
      emailService.notifyBidSuccess(
        bidder.email,
        result.product.name,
        amount,
        productService.buildProductLink(productId)
      );

      // Gửi cho người thua cuộc (Outbid)
      if (
        result.previousWinnerEmail &&
        result.previousWinnerEmail !== bidder.email
      ) {
        emailService.notifyOutbidAlert(
          result.previousWinnerEmail,
          result.product.name,
          amount,
          productService.buildProductLink(productId)
        );
      }
    } catch (err) {
      logger.error("Lỗi gửi email sau đấu giá:", err);
      // Không throw error ở đây để user vẫn nhận được phản hồi đặt giá thành công
    }

    return result.newBid;
  }

  async kickBidder(
    productId: string,
    sellerId: string,
    bidderId: string,
    reason: string
  ) {
    // 1. Transaction để đảm bảo tính nhất quán
    const result = await db.transaction(async (tx) => {
      // LOCK sản phẩm để không ai bid chen ngang lúc đang xử lý
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.sellerId, sellerId)))
        .for("update");

      if (!product) {
        // Có thể check sellerId ở ngoài, hoặc check trong này.
        // Nếu query trên trả về empty -> hoặc không tồn tại, hoặc không phải chủ.
        throw new ForbiddenError(
          "Sản phẩm không tồn tại hoặc bạn không phải chủ sở hữu"
        );
      }

      // 2. Vô hiệu hóa tất cả BIDS của user này
      await tx
        .update(bids)
        .set({ status: "INVALID" })
        .where(
          and(
            eq(bids.productId, productId),
            eq(bids.userId, bidderId), // Target bidder
            eq(bids.status, "VALID")
          )
        );

      // 3. Vô hiệu hóa AUTO-BIDS của user này
      await tx
        .update(autoBids)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(autoBids.productId, productId),
            eq(autoBids.userId, bidderId),
            eq(autoBids.isActive, true)
          )
        );

      // 4. Tìm người giữ giá cao nhất MỚI (sau khi kick)
      const topBid = await tx.query.bids.findFirst({
        where: and(
          eq(bids.productId, productId),
          eq(bids.status, "VALID") // Chỉ lấy bid hợp lệ còn lại
        ),
        orderBy: desc(bids.amount),
      });

      // 5. Cập nhật lại sản phẩm về trạng thái quá khứ gần nhất
      let newPrice = product.startPrice;
      let newWinnerId = null;

      if (topBid) {
        newPrice = topBid.amount;
        newWinnerId = topBid.userId;
      }

      // Update lại Product
      await tx
        .update(products)
        .set({
          currentPrice: newPrice,
          winnerId: newWinnerId,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      return {
        productName: product.name,
        newWinnerId,
      };
    });

    // --- SAU TRANSACTION ---

    // 6. [QUAN TRỌNG] Kích hoạt lại AutoBid Check
    // Lý do: Sau khi kick người A, giá rớt xuống người B.
    // Có thể người C có AutoBid cao hơn giá hiện tại của B -> Hệ thống cần tự động đấu giá lại giữa B và C.
    await systemService.triggerAutoBidCheck(productId);

    // 7. Gửi email thông báo
    const bidder = await userService.getById(bidderId);
    if (bidder) {
      // Fire-and-forget email
      emailService.notifyBidRejected(
        bidder.email,
        result.productName,
        reason,
        productService.buildProductLink(productId)
      );
    }

    return {
      message: "Đã loại người đấu giá và tính toán lại giá sàn thành công",
    };
  }

  async createAutoBid(productId: string, userId: string, maxAmount: number) {
    return await db.transaction(async (tx) => {
      // 1. Kiểm tra sản phẩm có tồn tại và ĐANG DIỄN RA không
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
      });

      if (!product) {
        throw new NotFoundError("Sản phẩm không tồn tại");
      }

      const now = new Date();
      // [Quan trọng] Không cho phép bid nếu hết giờ hoặc không active
      if (
        product.status !== "ACTIVE" ||
        (product.endTime && product.endTime <= now)
      ) {
        throw new BadRequestError(
          "Phiên đấu giá đã kết thúc hoặc chưa bắt đầu"
        );
      }

      // 2. Kiểm tra xem user đã có AutoBid nào ĐANG ACTIVE chưa
      // [Quan trọng] Phải thêm isActive: true
      const existingAutoBid = await tx.query.autoBids.findFirst({
        where: and(
          eq(autoBids.productId, productId),
          eq(autoBids.userId, userId),
          eq(autoBids.isActive, true)
        ),
      });

      if (existingAutoBid) {
        throw new BadRequestError(
          "Bạn đã cài đặt đấu giá tự động cho sản phẩm này. Vui lòng sử dụng tính năng cập nhật."
        );
      }

      // 3. Validate giá tiền
      const currentPrice = Number(product.currentPrice || product.startPrice);
      const stepPrice = Number(product.stepPrice);

      // [Logic] Giá trần nên lớn hơn hoặc bằng (Giá hiện tại + 1 bước giá)
      if (maxAmount < currentPrice + stepPrice) {
        throw new BadRequestError(
          `Giá tối đa phải lớn hơn giá hiện tại của sản phẩm (${currentPrice + stepPrice})`
        );
      }

      // 4. Insert AutoBid mới
      const [newAutoBid] = await tx
        .insert(autoBids)
        .values({
          productId: productId,
          userId: userId,
          maxAmount: maxAmount.toString(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(), // [Quan trọng] Set updatedAt ban đầu = createdAt
        })
        .returning();

      if (!newAutoBid) {
        throw new BadRequestError("Tạo cấu hình đấu giá tự động thất bại");
      }

      // 5. Trigger xử lý đấu giá ngay lập tức
      // Lưu ý: Nên để logic này chạy SAU khi transaction commit thành công.
      // Tuy nhiên nếu trigger là async fire-and-forget thì để đây cũng tạm ổn.
      await systemService.triggerAutoBidCheck(productId);

      return newAutoBid;
    });
  }

  async updateAutoBid(autoBidId: string, userId: string, maxAmount: number) {
    return await db.transaction(async (tx) => {
      // 1. Tìm AutoBid active và PHẢI THUỘC VỀ USER ĐÓ
      const autoBid = await tx.query.autoBids.findFirst({
        where: and(
          eq(autoBids.id, autoBidId),
          eq(autoBids.userId, userId), // Security check
          eq(autoBids.isActive, true)
        ),
      });

      if (!autoBid) {
        throw new NotFoundError(
          "Không tìm thấy cấu hình đấu giá tự động hợp lệ của bạn"
        );
      }

      // 2. Kiểm tra lại trạng thái sản phẩm
      const product = await tx.query.products.findFirst({
        where: eq(products.id, autoBid.productId),
      });

      if (!product) {
        throw new NotFoundError("Sản phẩm không tồn tại");
      }

      const now = new Date();
      if (
        product.status !== "ACTIVE" ||
        (product.endTime && product.endTime <= now)
      ) {
        throw new BadRequestError(
          "Không thể cập nhật giá khi phiên đấu giá đã kết thúc"
        );
      }

      const currentPrice = Number(product.currentPrice || product.startPrice);
      const stepPrice = Number(product.stepPrice);

      // 3. Validate giá mới
      // User có thể giảm MaxBid, nhưng không được thấp hơn giá hiện tại của sản phẩm cộng với bước giá
      if (maxAmount < currentPrice + stepPrice) {
        throw new BadRequestError(
          `Giá tối đa mới không được thấp hơn giá hiện tại của sản phẩm cộng với bước giá (${currentPrice + stepPrice})`
        );
      }

      // [Optional] Kiểm tra: Nếu user đang là winner, họ có quyền hạ MaxAmount xuống
      // miễn là > currentPrice + stepPrice. Logic này hợp lệ với eBay.
      if (product.winnerId === userId) {
        // Không cần thêm logic gì, đã kiểm tra ở trên rồi
      } else {
        // Nếu user không phải là winner, đảm bảo MaxAmount mới phải > currentPrice + stepPrice
        if (maxAmount < currentPrice + stepPrice) {
          throw new BadRequestError(
            `Giá tối đa mới phải lớn hơn giá hiện tại của sản phẩm cộng với bước giá (${currentPrice + stepPrice})`
          );
        }
      }

      // 4. Thực hiện Update
      await tx
        .update(autoBids)
        .set({
          maxAmount: maxAmount.toString(),
          updatedAt: new Date(), // [CỰC KỲ QUAN TRỌNG] Để logic sort trong processAutoBid hoạt động đúng
        })
        .where(eq(autoBids.id, autoBidId));

      // 5. Trigger lại hệ thống đấu giá
      // Vì có thể giá mới cao hơn sẽ kích hoạt bid đè lên người khác
      await systemService.triggerAutoBidCheck(autoBid.productId);

      return { message: "Cập nhật giá trần thành công" };
    });
  }

  async deleteAutoBid(autoBidId: string, userId: string) {
    // 1. Kiểm tra tồn tại
    const autoBid = await db.query.autoBids.findFirst({
      where: and(
        eq(autoBids.id, autoBidId),
        eq(autoBids.userId, userId),
        eq(autoBids.isActive, true)
      ),
      with: {
        product: true, // Lấy thông tin sản phẩm để check trạng thái
      },
    });

    if (!autoBid) {
      throw new NotFoundError(
        "Cấu hình đấu giá tự động không tồn tại hoặc đã bị hủy"
      );
    }

    // 2. Soft Delete (Chuyển về inactive)
    await db
      .update(autoBids)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(autoBids.id, autoBidId));

    // Lưu ý: Không cần update lại giá sản phẩm.
    // Vì AutoBid chỉ là cấu hình "Tương lai".
    // Những bid "Quá khứ" do AutoBid sinh ra đã nằm trong bảng `bids` và vẫn có hiệu lực.

    return { message: "Đã hủy đấu giá tự động thành công" };
  }

  private async getAutoExtendConfig() {
    const settings = await db.query.auctionSettings.findFirst({
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
    });

    return {
      thresholdMinutes: settings?.extendThresholdMinutes ?? 5,
      durationMinutes: settings?.extendDurationMinutes ?? 10,
    };
  }
}

export const bidService = new BidService();
