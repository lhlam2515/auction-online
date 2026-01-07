import type {
  GetOrdersParams,
  OrderWithDetails,
  PaymentMethod,
  ShippingProvider,
} from "@repo/shared-types";
import { Decimal } from "decimal.js";
import { eq, and, sql, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, orderPayments } from "@/models";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

import { ratingService } from "./rating.service";

type DbTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

export class OrderService {
  async createFromAuction(
    productId: string,
    winnerId: string,
    sellerId: string,
    finalPrice: number,
    tx: DbTransaction = db
  ) {
    // 1. Kiểm tra xem đơn hàng đã tồn tại chưa (Idempotency Check)
    const existingOrder = await tx.query.orders.findFirst({
      where: eq(orders.productId, productId),
      columns: { id: true },
    });

    if (existingOrder) {
      // Nếu đã có order, trả về luôn order đó (hoặc throw error tùy logic)
      // Ở đây ta return để quy trình không bị crash nếu lỡ gọi 2 lần
      return existingOrder;
    }

    // 2. Tạo mã đơn hàng duy nhất
    // Format: ORD-<timestamp>-<random3digits>
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    // 3. Tính toán chi phí (nếu có)
    // Ở đây ta giả sử không có phí vận chuyển cho đơn đấu giá
    // Nếu có thể thêm logic tính phí vận chuyển dựa trên địa chỉ người mua sau này
    const price = new Decimal(finalPrice);
    const shippingCost = new Decimal(0);
    const totalAmount = price.plus(shippingCost);

    // 5. Insert Order
    const [newOrder] = await tx
      .insert(orders)
      .values({
        orderNumber,
        productId,
        winnerId,
        sellerId,
        finalPrice: finalPrice.toString(),
        shippingCost: shippingCost.toString(),
        totalAmount: totalAmount.toString(),
        status: "PENDING",
        shippingAddress: "",
        phoneNumber: "",
        createdAt: new Date(),
      })
      .returning();

    return newOrder;
  }

  async getById(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        product: {
          columns: { name: true, slug: true },
          with: {
            images: {
              where: (img, { eq }) => eq(img.isMain, true),
              limit: 1,
              columns: { imageUrl: true },
            },
          },
        },
        winner: {
          columns: {
            fullName: true,
            email: true,
            address: true,
            ratingScore: true,
          },
        },
        seller: {
          columns: {
            fullName: true,
            email: true,
            address: true,
            ratingScore: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Không tìm thấy đơn hàng");
    }

    return this.transformOrderDetails(order);
  }

  async getByUser(
    userId: string,
    role: "BIDDER" | "SELLER",
    params?: GetOrdersParams
  ) {
    const { status, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;

    const conditions = [
      role === "BIDDER"
        ? eq(orders.winnerId, userId)
        : eq(orders.sellerId, userId),
    ];

    if (status) conditions.push(eq(orders.status, status));

    const ordersList = await db.query.orders.findMany({
      where: and(...conditions),
      with: {
        product: {
          columns: { name: true, slug: true },
          with: {
            images: {
              where: (img, { eq }) => eq(img.isMain, true),
              limit: 1,
              columns: { imageUrl: true },
            },
          },
        },
        winner: { columns: { fullName: true } },
        seller: { columns: { fullName: true } },
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit,
      offset,
    });

    return ordersList.map(this.transformOrderDetails);
  }

  async updateShippingInfo(
    orderId: string,
    buyerId: string,
    shippingAddress: string,
    phoneNumber: string,
    tx: DbTransaction = db
  ) {
    const [updatedOrder] = await tx
      .update(orders)
      .set({
        shippingAddress,
        phoneNumber,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.winnerId, buyerId),
          sql`${orders.status} IN ('PENDING', 'PAID')`
        )
      )
      .returning();

    if (!updatedOrder) {
      await this.handleUpdateError(
        orderId,
        buyerId,
        "winnerId",
        ["PENDING", "PAID"],
        tx
      );
    }

    return updatedOrder;
  }

  async markAsPaid(
    orderId: string,
    buyerId: string,
    paymentMethod: PaymentMethod,
    amount: string,
    paymentProofUrl: string,
    transactionId?: string
  ) {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

      if (order.winnerId !== buyerId) {
        throw new ForbiddenError("Không phải đơn hàng của bạn");
      }

      if (order.status !== "PENDING") {
        throw new BadRequestError("Đơn hàng không ở trạng thái chờ xử lý");
      }

      // Buyer must provide shipping info before payment
      if (!order.shippingAddress || !order.phoneNumber) {
        throw new BadRequestError(
          "Vui lòng cung cấp địa chỉ giao hàng và số điện thoại trước khi thanh toán"
        );
      }

      const orderTotal = new Decimal(order.totalAmount);
      const paidAmount = new Decimal(amount);
      if (!paidAmount.equals(orderTotal)) {
        throw new BadRequestError(
          `Số tiền thanh toán không hợp lệ. Yêu cầu: ${orderTotal.toString()}, Đã cung cấp: ${paidAmount.toString()}`
        );
      }

      // Create payment record with proof URL - status remains PENDING until seller confirms
      const [payment] = await tx
        .insert(orderPayments)
        .values({
          orderId,
          method: paymentMethod as PaymentMethod,
          amount: amount.toString(),
          status: "PENDING", // Changed from SUCCESS to PENDING
          paymentProofUrl, // Add the proof URL
          transactionRef: transactionId,
        })
        .returning();

      // Order status remains PENDING until seller confirms payment
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.status, "PENDING")))
        .returning();

      if (!updatedOrder) {
        throw new BadRequestError(
          "Không thể cập nhật đơn hàng trong quá trình tải lên minh chứng thanh toán"
        );
      }

      return { order: updatedOrder, payment };
    });
  }

  async confirmPayment(orderId: string, sellerId: string) {
    return await db.transaction(async (tx) => {
      // First check if order exists and has payment proof
      const orderWithPayment = await tx.query.orders.findFirst({
        where: and(
          eq(orders.id, orderId),
          eq(orders.sellerId, sellerId),
          eq(orders.status, "PENDING")
        ),
        with: {
          payment: true,
        },
      });

      if (!orderWithPayment) {
        throw new NotFoundError(
          "Không tìm thấy đơn hàng hoặc bạn không có quyền"
        );
      }

      if (!orderWithPayment.payment?.paymentProofUrl) {
        throw new BadRequestError(
          "Người mua chưa upload minh chứng thanh toán"
        );
      }

      if (orderWithPayment.sellerConfirmedAt) {
        throw new BadRequestError("Thanh toán đã được xác nhận trước đó");
      }

      // Update payment status to SUCCESS and set paidAt
      await tx
        .update(orderPayments)
        .set({
          status: "SUCCESS",
          paidAt: new Date(),
        })
        .where(eq(orderPayments.orderId, orderId));

      // Update order status to PAID and set seller confirmation
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "PAID",
          sellerConfirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.sellerId, sellerId),
            eq(orders.status, "PAID"),
            isNull(orders.sellerConfirmedAt) // Chỉ confirm nếu chưa confirm trước đó
          )
        )
        .returning();

      if (!updatedOrder) {
        await this.handleUpdateError(
          orderId,
          sellerId,
          "sellerId",
          ["PAID"],
          tx
        );
        throw new BadRequestError(
          "Thanh toán đã được xác nhận trước đó hoặc ở trạng thái không hợp lệ"
        );
      }

      return updatedOrder;
    });
  }

  async shipOrder(
    orderId: string,
    sellerId: string,
    trackingNumber: string,
    shippingProvider: ShippingProvider
  ) {
    return await db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "SHIPPED",
          trackingNumber: trackingNumber,
          shippingProvider: shippingProvider,
          shippedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.sellerId, sellerId),
            eq(orders.status, "PAID")
          )
        )
        .returning();

      if (!updatedOrder) {
        await this.handleUpdateError(
          orderId,
          sellerId,
          "sellerId",
          ["PAID"],
          tx
        );
      }

      return updatedOrder;
    });
  }

  async receiveOrder(orderId: string, buyerId: string) {
    return await db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "COMPLETED",
          receivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.winnerId, buyerId),
            eq(orders.status, "SHIPPED"),
            isNotNull(orders.sellerConfirmedAt) // Seller must confirm payment first
          )
        )
        .returning();

      if (!updatedOrder) {
        await this.handleUpdateError(
          orderId,
          buyerId,
          "winnerId",
          ["SHIPPED"],
          tx
        );
      }

      return updatedOrder;
    });
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    return await db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "CANCELLED",
          cancelReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.sellerId, userId),
            eq(orders.status, "PENDING")
          )
        )
        .returning();

      if (!updatedOrder) {
        await this.handleUpdateError(
          orderId,
          userId,
          "sellerId",
          ["PENDING"],
          tx
        );
      }

      // Leave negative feedback automatically
      await ratingService.createFeedback(orderId, userId, -1, reason);

      return updatedOrder;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformOrderDetails(order: any): OrderWithDetails {
    return {
      ...order,
      product: order.product
        ? {
            name: order.product.name,
            slug: order.product.slug,
            thumbnail: order.product.images?.[0]?.imageUrl ?? null,
          }
        : null,
      winner: order.winner ?? null,
      seller: order.seller ?? null,
    };
  }

  private async handleUpdateError(
    orderId: string,
    userId: string,
    userField: "winnerId" | "sellerId",
    expectedStatuses: string[],
    tx: DbTransaction
  ) {
    const order = await tx.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { winnerId: true, sellerId: true, status: true },
    });

    if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

    // Check quyền sở hữu
    if (order[userField] !== userId) {
      throw new ForbiddenError("Bạn không có quyền cập nhật đơn hàng này");
    }

    // Check trạng thái
    if (!expectedStatuses.includes(order.status)) {
      throw new BadRequestError(
        `Trạng thái đơn hàng không hợp lệ. Hiện tại: ${order.status}, Yêu cầu: ${expectedStatuses.join(" hoặc ")}`
      );
    }

    throw new BadRequestError(
      "Không thể cập nhật đơn hàng do trạng thái xung đột"
    );
  }
}

export const orderService = new OrderService();
