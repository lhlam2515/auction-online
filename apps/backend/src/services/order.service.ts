import type { GetOrdersParams, OrderWithDetails } from "@repo/shared-types";
import { eq, and, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, productImages, products } from "@/models";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

export class OrderService {
  async createFromAuction(
    productId: string,
    winnerId: string,
    sellerId: string,
    finalPrice: number
  ) {
    // TODO: create order after auction ends
    return await db.transaction(async (tx) => {
      // validate auction ended and winner
      // create order record
      throw new BadRequestError("Not implemented");
    });
  }

  async getById(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { product: true, winner: true, seller: true },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    const thumbnail = await db.query.productImages.findFirst({
      where: sql`${productImages.productId} = ${order.product.id} AND ${productImages.isMain} = true`,
    });

    // Transform to match OrderWithDetails interface
    const transformedOrder = {
      ...order,
      product: {
        name: order.product.name,
        slug: order.product.slug,
        thumbnail: thumbnail ? thumbnail.imageUrl : undefined,
      },
      winner: {
        fullName: order.winner.fullName,
        email: order.winner.email,
      },
      seller: {
        fullName: order.seller.fullName,
        email: order.seller.email,
      },
    };

    return transformedOrder as OrderWithDetails;
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
      with: { product: true, winner: true, seller: true, payments: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit,
      offset,
    });

    // Transform to match OrderWithDetails interface
    const transformedOrders = ordersList.map((order) => {
      return {
        ...order,
        product: {
          name: order.product.name,
          slug: order.product.slug,
          thumbnail: undefined, // Could fetch thumbnail if needed
        },
        winner: {
          fullName: order.winner.fullName,
          email: order.winner.email,
        },
        seller: {
          fullName: order.seller.fullName,
          email: order.seller.email,
        },
      };
    });

    return transformedOrders as OrderWithDetails[];
  }

  async updatePaymentInfo(
    orderId: string,
    buyerId: string,
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
    contactPhone: string
  ) {
    const order = await this.getById(orderId);

    if (order.winnerId !== buyerId) {
      throw new ForbiddenError("Not your order");
    }

    // TODO: update payment and shipping info
    throw new BadRequestError("Not implemented");
  }

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await this.getById(orderId);

    if (order.winnerId !== buyerId) {
      throw new ForbiddenError("Not your order");
    }

    // TODO: mark as delivered, trigger rating flow
    throw new BadRequestError("Not implemented");
  }

  async markAsPaid(
    orderId: string,
    paymentMethod: string,
    amount: number,
    transactionId?: string
  ) {
    const order = await this.getById(orderId);

    // TODO: mark order as paid and update payment details
    throw new BadRequestError("Not implemented");
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.getById(orderId);

    // TODO: validate cancellation rules and update status
    throw new BadRequestError("Not implemented");
  }
}

export const orderService = new OrderService();
