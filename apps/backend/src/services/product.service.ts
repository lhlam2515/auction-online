import { db } from "@/config/database";
import { products } from "@/models";
import { eq, desc, and } from "drizzle-orm";
import { BadRequestError, NotFoundError, ConflictError } from "@/utils/errors";

export interface ProductFilters {
  q?: string;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Pagination {
  page: number;
  limit: number;
}

export class ProductService {
  async search(filters: ProductFilters, pagination: Pagination) {
    // TODO: build query dynamically based on filters and paginate
    return {
      items: [],
      page: pagination.page,
      limit: pagination.limit,
      total: 0,
    };
  }

  async getById(productId: string) {
    const result = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!result) throw new NotFoundError("Product not found");
    return result;
  }

  async getTopListings(type: "ending-soon" | "hot" | "new") {
    // TODO: implement ranking logic per type
    return [];
  }

  async getRelatedProducts(productId: string) {
    // TODO: implement related products by category/keywords
    return [];
  }

  async create(sellerId: string, data: any) {
    // TODO: validate business rules and insert product
    return await db.transaction(async (tx) => {
      // placeholder
      return { id: "temp" };
    });
  }

  async delete(productId: string, sellerId: string) {
    // TODO: ensure auction not active, then delete
    throw new ConflictError("Not implemented");
  }

  async updateDescription(
    productId: string,
    sellerId: string,
    newDesc: string
  ) {
    // TODO: append description update history
    throw new BadRequestError("Not implemented");
  }

  async toggleAutoExtend(productId: string, sellerId: string) {
    // TODO: toggle flag
    return true;
  }
}

export const productService = new ProductService();
