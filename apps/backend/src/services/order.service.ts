import { db } from "@/config/database";
import { orders } from "@/models";
import { eq, and } from "drizzle-orm";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

export interface CreateOrderInput {
  productId: string;
  winnerId: string;
  sellerId: string;
  finalPrice: number;
}

export interface UpdateShippingInput {
  shippingAddress: string;
  shippingMethod?: string;
}

export class OrderService {
  async createFromAuction(input: CreateOrderInput) {
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

  async updateShipping(
    orderId: string,
    buyerId: string,
    data: UpdateShippingInput
  ) {
    const order = await this.getById(orderId);

    if (order.winnerId !== buyerId) {
      throw new ForbiddenError("Not your order");
    }

    // TODO: update shipping info
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

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.getById(orderId);

    // TODO: validate cancellation rules and update status
    throw new BadRequestError("Not implemented");
  }
}

export const orderService = new OrderService();
