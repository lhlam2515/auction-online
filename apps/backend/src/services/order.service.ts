import type {
  GetOrdersParams,
  OrderWithDetails,
  PaymentMethod,
  ShippingProvider,
} from "@repo/shared-types";
import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, orderPayments } from "@/models";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

import { ratingService } from "./rating.service";

export type ShippingAddress = {
  street: string;
  district: string;
  city: string;
};

export class OrderService {
  async createFromAuction(
    productId: string,
    winnerId: string,
    sellerId: string,
    finalPrice: number,
    isBuyNow: boolean = false, // Đổi tên biến cho rõ nghĩa
    tx: any = db // Dùng type any cho gọn hoặc type chuẩn của Drizzle
  ) {
    // 1. Kiểm tra xem đơn hàng đã tồn tại chưa (Idempotency Check)
    // Đây là check quan trọng nhất để tránh duplicate order
    const existingOrder = await tx.query.orders.findFirst({
      where: eq(orders.productId, productId),
    });

    if (existingOrder) {
      // Nếu đã có order, trả về luôn order đó (hoặc throw error tùy logic)
      // Ở đây ta return để quy trình không bị crash nếu lỡ gọi 2 lần
      return existingOrder;
    }

    // 2. Validate nhanh dữ liệu đầu vào (Optional - vì caller thường đã đảm bảo)
    if (!productId || !winnerId) {
      throw new Error("Missing required order information");
    }

    // Nếu seller đã bị xóa, không thể tạo order
    if (!sellerId) {
      throw new Error("Cannot create order when seller no longer exists");
    }

    // 3. Tạo mã đơn hàng (Unique Order Number)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    // 4. Tính toán sơ bộ
    const shippingCost = 0;
    const totalAmount = finalPrice + shippingCost;

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
        isBuyNow: isBuyNow, // Nên lưu flag này vào DB để thống kê/filter
        createdAt: new Date(),
      })
      .returning();

    return newOrder;
  }

  async getById(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        product: { with: { images: true } },
        winner: true,
        seller: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Transform to match OrderWithDetails interface
    // Handle nullable fields (user/product may be deleted)
    const transformedOrder: OrderWithDetails = {
      ...order,
      product: order.product
        ? {
            name: order.product.name,
            slug: order.product.slug,
            thumbnail: order.product.images.find((img) => img.isMain)?.imageUrl,
          }
        : null,
      winner: order.winner
        ? {
            fullName: order.winner.fullName,
            email: order.winner.email,
            address: order.winner.address,
            ratingScore: order.winner.ratingScore,
          }
        : null,
      seller: order.seller
        ? {
            fullName: order.seller.fullName,
            email: order.seller.email,
            address: order.seller.address,
            ratingScore: order.seller.ratingScore,
          }
        : null,
    };

    return transformedOrder;
  }

  async getByUser(
    userId: string,
    role: "BIDDER" | "SELLER",
    params?: GetOrdersParams
  ) {
    const { status, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;

    const statusCondition = status ? eq(orders.status, status) : undefined;
    const whereCondition =
      role === "BIDDER"
        ? eq(orders.winnerId, userId)
        : eq(orders.sellerId, userId);

    const ordersList = await db.query.orders.findMany({
      where: and(whereCondition, statusCondition),
      with: {
        product: { with: { images: true } },
        winner: true,
        seller: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit,
      offset,
    });

    // Transform to match OrderWithDetails interface
    // Handle nullable fields (user/product may be deleted)
    const transformedOrders: OrderWithDetails[] = ordersList.map((order) => {
      return {
        ...order,
        product: order.product
          ? {
              name: order.product.name,
              slug: order.product.slug,
              thumbnail: order.product.images.find((img) => img.isMain)
                ?.imageUrl,
            }
          : null,
        winner: order.winner
          ? {
              fullName: order.winner.fullName,
              email: order.winner.email,
              address: order.winner.address,
              ratingScore: order.winner.ratingScore,
            }
          : null,
        seller: order.seller
          ? {
              fullName: order.seller.fullName,
              email: order.seller.email,
              address: order.seller.address,
              ratingScore: order.seller.ratingScore,
            }
          : null,
      };
    });

    return transformedOrders;
  }

  async updateShippingInfo(
    orderId: string,
    buyerId: string,
    shippingAddress: string,
    phoneNumber: string
  ) {
    const order = await this.getById(orderId);

    // Handle nullable winnerId
    if (!order.winnerId) {
      throw new BadRequestError(
        "Cannot update shipping info - buyer information is missing"
      );
    }

    if (order.winnerId !== buyerId) {
      throw new ForbiddenError("Not your order");
    }

    if (order.status !== "PENDING" && order.status !== "PAID") {
      throw new BadRequestError(
        "Order status does not allow shipping info update"
      );
    }

    // Update order with shipping information
    const [updatedOrder] = await db
      .update(orders)
      .set({
        shippingAddress,
        phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async markAsPaid(
    orderId: string,
    buyerId: string,
    paymentMethod: PaymentMethod,
    amount: string,
    transactionId?: string
  ) {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new NotFoundError("Order");
      }

      // Handle nullable winnerId
      if (!order.winnerId) {
        throw new BadRequestError(
          "Cannot process payment - buyer information is missing"
        );
      }

      if (order.winnerId !== buyerId) {
        throw new ForbiddenError("Not your order");
      }

      if (order.status !== "PENDING") {
        throw new BadRequestError("Order is not in pending status");
      }

      // Buyer must provide shipping info before payment
      if (!order.shippingAddress || !order.phoneNumber) {
        throw new BadRequestError(
          "Please provide shipping address and phone number before payment"
        );
      }

      // Validate payment amount matches order total
      if (parseFloat(order.totalAmount) !== parseFloat(amount)) {
        throw new BadRequestError("Payment amount does not match order total");
      }

      // Create payment record
      const [payment] = await tx
        .insert(orderPayments)
        .values({
          orderId,
          method: paymentMethod as PaymentMethod,
          amount: amount.toString(),
          status: "SUCCESS",
          paidAt: new Date(),
          transactionRef: transactionId,
        })
        .returning();

      // Update order status to PAID
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "PAID",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      return { order: updatedOrder, payment };
    });
  }

  async confirmPayment(orderId: string, sellerId: string) {
    const order = await this.getById(orderId);

    // Handle nullable sellerId
    if (!order.sellerId) {
      throw new BadRequestError(
        "Cannot confirm payment - seller information is missing"
      );
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenError(
        "Only seller can confirm payment for this order"
      );
    }

    if (order.status !== "PAID") {
      throw new BadRequestError("Order must be paid before seller can confirm");
    }

    if (order.sellerConfirmedAt) {
      throw new BadRequestError("Payment already confirmed by seller");
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        sellerConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async shipOrder(
    orderId: string,
    sellerId: string,
    trackingNumber: string,
    shippingProvider: ShippingProvider
  ) {
    const order = await this.getById(orderId);

    // Handle nullable sellerId
    if (!order.sellerId) {
      throw new BadRequestError(
        "Cannot ship order - seller information is missing"
      );
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenError("Not your order");
    }

    if (order.status !== "PAID") {
      throw new BadRequestError("Order must be paid before shipping");
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "SHIPPED",
        trackingNumber: trackingNumber,
        shippingProvider: shippingProvider,
        shippedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async receiveOrder(orderId: string, buyerId: string) {
    const order = await this.getById(orderId);

    // Handle nullable winnerId
    if (!order.winnerId) {
      throw new BadRequestError(
        "Cannot receive order - buyer information is missing"
      );
    }

    if (order.winnerId !== buyerId) {
      throw new ForbiddenError("Not your order");
    }

    if (order.status !== "SHIPPED") {
      throw new BadRequestError(
        "Order must be shipped before confirming receipt"
      );
    }

    if (!order.sellerConfirmedAt) {
      throw new BadRequestError("Seller must confirm payment before shipping");
    }

    // Update order status to COMPLETED
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "COMPLETED",
        receivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.getById(orderId);

    // Handle nullable sellerId
    if (!order.sellerId) {
      throw new BadRequestError(
        "Cannot cancel order - seller information is missing"
      );
    }

    // Only seller can cancel order
    if (order.sellerId !== userId) {
      throw new ForbiddenError("Only seller can cancel this order");
    }

    // Can only cancel if order is still pending
    if (order.status !== "PENDING") {
      throw new BadRequestError("Only pending orders can be cancelled");
    }

    // Update order status to CANCELLED
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "CANCELLED",
        cancelReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // Leave negative feedback automatically
    await ratingService.createFeedback(orderId, userId, -1, reason);

    return updatedOrder;
  }
}

export const orderService = new OrderService();
