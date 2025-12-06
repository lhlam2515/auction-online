import type {
  CreateProductRequest,
  UpdateDescriptionRequest,
  ProductSearchParams,
  ProductsQueryParams,
  SearchProductsParams,
  PaginationParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { eq, desc, and } from "drizzle-orm";

import { db } from "@/config/database";
import {
  bids,
  categories,
  productImages,
  products,
  users,
  watchLists,
} from "@/models";
import { Product } from "@/types/model";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/utils/errors";

export class ProductService {
  async search(params: ProductSearchParams): Promise<PaginatedResponse<any>> {
    // TODO: build query dynamically based on filters and paginate
    return {
      items: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async searchProducts(
    params: SearchProductsParams
  ): Promise<PaginatedResponse<any>> {
    // TODO: implement product search with keyword and filters
    return {
      items: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async getProducts(
    params: ProductsQueryParams
  ): Promise<PaginatedResponse<any>> {
    // TODO: get products with query parameters
    return {
      items: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async getById(productId: string): Promise<Product> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!result) throw new NotFoundError("Product");
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

  async create(sellerId: string, data: CreateProductRequest) {
    // validate business rules and insert product
    if (!sellerId) throw new BadRequestError("Seller ID is required");

    const {
      name,
      description,
      categoryId,
      startPrice,
      buyNowPrice,
      stepPrice,
      startTime,
      endTime,
      isAutoExtend,
      images,
    } = data;

    return await db.transaction(async (tx) => {
      // ensure seller exists
      const seller = await tx.query.users.findFirst({
        where: eq(users.id, sellerId),
      });
      if (!seller) throw new NotFoundError("Seller not found");

      // ensure category exists
      const category = await tx.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });
      if (!category) throw new NotFoundError("Category not found");

      if (new Date(endTime) <= new Date(startTime)) {
        throw new BadRequestError("End time must be after start time");
      }

      // generate slug and ensure uniqueness
      // Normalize unicode to remove diacritics (Vietnamese accents) and
      // map 'đ'/'Đ' to 'd'/'D' before slugifying so names with Vietnamese
      // characters produce ASCII-friendly slugs.
      const cleanedName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

      const baseSlug = cleanedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      let slug = baseSlug;
      let i = 0;
      while (true) {
        const exists = await tx.query.products.findFirst({
          where: eq(products.slug, slug),
        });
        if (!exists) break;
        i += 1;
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}-${i}`;
      }

      const [created] = await tx
        .insert(products)
        .values([
          {
            sellerId,
            categoryId,
            name,
            slug,
            description,
            startPrice: Number(startPrice),
            stepPrice: Number(stepPrice),
            buyNowPrice: buyNowPrice != null ? Number(buyNowPrice) : null,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            isAutoExtend: isAutoExtend ?? true,
          } as any,
        ])
        .returning();

      // insert product images
      const imageRows = images.map((url, idx) => ({
        productId: created.id,
        imageUrl: url,
        altText: `${name} ${idx + 1}`,
        displayOrder: idx + 1,
        isMain: idx === 0,
      }));
      await tx.insert(productImages).values(imageRows as any[]);

      return created;
    });
  }

  async delete(productId: string, sellerId: string) {
    // ensure auction not active, then delete
    const product = await this.getById(productId);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenError("Not authorized to delete this product");
    }
    if (product.status === "ACTIVE") {
      throw new ConflictError("Cannot delete an active auction product");
    }
    await db.delete(products).where(eq(products.id, productId));
  }

  async updateDescription(
    productId: string,
    sellerId: string,
    description: string
  ) {
    // TODO: append description update history
    throw new BadRequestError("Not implemented");
  }

  async toggleAutoExtend(
    productId: string,
    sellerId: string,
    extendMinutes?: number
  ) {
    // TODO: toggle auto extend flag and set extension duration
    return true;
  }
}

export const productService = new ProductService();
