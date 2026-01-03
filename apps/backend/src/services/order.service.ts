import type {
  GetOrdersParams,
  OrderWithDetails,
  PaymentMethod,
} from "@repo/shared-types";
import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, products, orderPayments, ratings, users } from "@/models";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

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
    buyNow: boolean = false,
    tx: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0] = db
  ) {
    // Validate product exists and auction has ended
    const product = await tx.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!buyNow && product.status !== "SOLD") {
      throw new BadRequestError("Auction has not ended or no winner");
    }

    // Handle nullable winnerId - validate only for non-buyNow scenarios
    if (!buyNow && !product.winnerId) {
      throw new BadRequestError("Product has no winner assigned");
    }

    if (!buyNow && product.winnerId !== winnerId) {
      throw new BadRequestError("Invalid winner for this auction");
    }

    if (product.sellerId !== sellerId) {
      throw new BadRequestError("Invalid seller for this product");
    }

    if (!buyNow && product.endTime > new Date()) {
      throw new BadRequestError("Auction is still ongoing");
    }

    if (buyNow && product.buyNowPrice === null) {
      throw new BadRequestError(
        "Buy Now option is not available for this product"
      );
    }

    // Update product status to SOLD if bought via Buy Now
    if (buyNow) {
      await tx
        .update(products)
        .set({
          status: "SOLD",
          winnerId: winnerId,
          currentPrice: finalPrice.toString(),
          endTime: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    }

    // Generate unique order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Calculate total amount (final price + shipping cost, shipping cost will be updated later)
    const shippingCost = 0; // Default, will be updated when buyer provides shipping info
    const totalAmount = finalPrice + shippingCost;

    // Create order record
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
        shippingAddress: "", // Will be updated later
        phoneNumber: "", // Will be updated later
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
    _shippingProvider?: string
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

    // Note: shippingProvider could be stored if we add it to the model
    // For now, we'll skip it or could add it later

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "SHIPPED",
        trackingNumber: trackingNumber || null,
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
    await this.leaveFeedback(orderId, userId, -1, reason);

    return updatedOrder;
  }

  async leaveFeedback(
    orderId: string,
    userId: string,
    rating: number,
    comment?: string
  ) {
    const order = await this.getById(orderId);

    // Handle nullable fields - cannot leave feedback if users deleted
    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Cannot leave feedback - buyer or seller information is missing"
      );
    }

    // Check if user is buyer or seller of this order
    if (order.winnerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenError(
        "Not authorized to leave feedback for this order"
      );
    }

    // Can only leave feedback for completed or cancelled orders
    if (order.status !== "COMPLETED" && order.status !== "CANCELLED") {
      throw new BadRequestError(
        "Can only leave feedback for completed or cancelled orders"
      );
    }

    // Determine receiver (the other party in the transaction)
    const receiverId =
      order.winnerId === userId ? order.sellerId : order.winnerId;

    // Handle nullable productId
    if (!order.productId) {
      throw new BadRequestError(
        "Cannot leave feedback - product information is missing"
      );
    }

    // Check if user already left feedback for this specific order
    // Query by checking productId + senderId + correct receiver to ensure it's from this order
    const existingFeedback = await db.query.ratings.findFirst({
      where: and(
        eq(ratings.productId, order.productId),
        eq(ratings.senderId, userId),
        eq(ratings.receiverId, receiverId)
      ),
    });

    if (existingFeedback) {
      throw new BadRequestError("You already left feedback for this order");
    }

    // Create rating record
    const [newRating] = await db
      .insert(ratings)
      .values({
        productId: order.productId,
        senderId: userId,
        receiverId,
        score: rating,
        comment: comment || null,
      })
      .returning();

    // Update receiver's rating score and count
    const receiver = await db.query.users.findFirst({
      where: eq(users.id, receiverId),
    });

    if (receiver) {
      const newRatingCount = receiver.ratingCount + 1;
      const newRatingScore =
        (receiver.ratingScore * receiver.ratingCount + rating) / newRatingCount;

      await db
        .update(users)
        .set({
          ratingScore: newRatingScore,
          ratingCount: newRatingCount,
          updatedAt: new Date(),
        })
        .where(eq(users.id, receiverId));
    }

    return newRating;
  }
}

export const orderService = new OrderService();
