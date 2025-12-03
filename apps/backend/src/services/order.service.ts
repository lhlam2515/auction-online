import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { orders } from "@/models";
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
    const result = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!result) throw new NotFoundError("Order not found");
    return result;
  }

  async getByUser(userId: string, role: "buyer" | "seller") {
    // TODO: get orders filtered by buyer or seller
    return [];
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
