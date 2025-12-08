import type {
  CreateProductRequest,
  UpdateDescriptionRequest,
  ProductSearchParams,
  ProductsQueryParams,
  SearchProductsParams,
  PaginationParams,
  PaginatedResponse,
  UpdateDescriptionResponse,
  ProductImage,
  Product,
  TopListingType,
  TopListingResponse,
  ProductListing,
} from "@repo/shared-types";
import { eq, desc, and, asc, count, sql, gt, max, inArray } from "drizzle-orm";

import { db } from "@/config/database";
import {
  bids,
  categories,
  productImages,
  products,
  productUpdates,
  users,
  watchLists,
} from "@/models";
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

  async getTopListings(
    limit: number,
    userId?: string
  ): Promise<TopListingResponse> {
    const listings: TopListingResponse = {
      endingSoon: [],
      hot: [],
      highestPrice: [],
    };

    const now = new Date();

    // Điều kiện dùng chung cho cả 3 truy vấn
    const activeAndNotEnded = and(
      eq(products.status, "ACTIVE"),
      gt(products.endTime, now)
    );

    // --------------------------
    // 1️⃣ Ending soon
    // --------------------------
    const endingSoonRows = await db.query.products.findMany({
      where: activeAndNotEnded,
      orderBy: asc(products.endTime),
      limit,
    });

    listings.endingSoon = await this.enrichProducts(endingSoonRows, userId);

    // --------------------------
    // 2️⃣ Hot products (most bids)
    // --------------------------
    const hotRows = await db
      .select({ product: products })
      .from(products)
      .leftJoin(
        bids,
        and(eq(bids.productId, products.id), eq(bids.status, "VALID"))
      )
      .where(activeAndNotEnded)
      .groupBy(products.id)
      .orderBy(desc(count(bids.id)))
      .limit(limit);

    listings.hot = await this.enrichProducts(
      hotRows.map((r) => r.product),
      userId
    );

    // --------------------------
    // 3️⃣ Highest price (fast + clear)
    // --------------------------
    const maxBidSub = db
      .select({
        productId: bids.productId,
        maxAmount: sql`MAX(${bids.amount})`.as("maxAmount"),
      })
      .from(bids)
      .where(eq(bids.status, "VALID"))
      .groupBy(bids.productId)
      .as("maxBid");

    const highestRows = await db
      .select({
        product: products,
        currentPrice: sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice})`,
      })
      .from(products)
      .leftJoin(maxBidSub, eq(maxBidSub.productId, products.id))
      .where(activeAndNotEnded)
      .orderBy(
        desc(sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice})`)
      )
      .limit(limit);

    listings.highestPrice = await this.enrichProducts(
      highestRows.map((r) => r.product),
      userId
    );

    return listings;
  }

  async getRelatedProducts(productId: string) {
    // TODO: implement related products by category/keywords
    return [];
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const product = await this.getById(productId);
    if (!product) {
      throw new NotFoundError("Product");
    }

    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
      orderBy: asc(productImages.displayOrder),
    });
    return images;
  }

  async getDescriptionUpdates(
    productId: string
  ): Promise<UpdateDescriptionResponse[]> {
    const product = await this.getById(productId);
    if (!product) {
      throw new NotFoundError("Product");
    }

    const updates = await db.query.productUpdates.findMany({
      where: eq(productUpdates.productId, productId),
      orderBy: asc(productUpdates.createdAt),
    });
    return updates;
  }

  async create(sellerId: string, data: CreateProductRequest): Promise<Product> {
    // validate business rules and insert product
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
      if (!seller) throw new NotFoundError("Seller");

      // ensure category exists
      const category = await tx.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });
      if (!category) throw new NotFoundError("Category");

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
  ): Promise<UpdateDescriptionResponse> {
    // append description update history
    const product = await this.getById(productId);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenError("Not authorized to update this product");
    }
    return await db.transaction(async (tx) => {
      const [updatedContent] = await tx
        .insert(productUpdates)
        .values({
          productId,
          updatedBy: sellerId,
          content: description,
        } as any)
        .returning();
      return updatedContent;
    });
  }

  async setAutoExtend(
    productId: string,
    sellerId: string,
    isAutoExtend: boolean
  ) {
    // set auto extend flag
    const product = await this.getById(productId);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenError("Not authorized to update this product");
    }
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({ isAutoExtend, updatedAt: new Date() })
        .where(eq(products.id, productId));
    });
  }

  /**
   * Enrich a list of products with related data in batch to avoid N+1 queries.
   */
  private async enrichProducts(
    productsList: Product[],
    userId?: string
  ): Promise<ProductListing[]> {
    if (!productsList.length) return [];

    // ===== Extract IDs =====
    const productIds = productsList.map((p) => p.id);
    const categoryIds = [...new Set(productsList.map((p) => p.categoryId))];
    const sellerIds = [...new Set(productsList.map((p) => p.sellerId))];

    // ===== Batch fetch: categories & sellers =====
    const [categoriesRows, sellersRows] = await Promise.all([
      db.query.categories.findMany({
        where: inArray(categories.id, categoryIds),
      }),
      db.query.users.findMany({
        where: inArray(users.id, sellerIds),
      }),
    ]);

    // ===== Images, bidCounts, watchCounts =====
    const [mainImages, bidCounts, watchCounts] = await Promise.all([
      db.query.productImages.findMany({
        where: and(
          eq(productImages.isMain, true),
          inArray(productImages.productId, productIds)
        ),
      }),

      db
        .select({
          productId: bids.productId,
          value: count(),
        })
        .from(bids)
        .where(
          and(eq(bids.status, "VALID"), inArray(bids.productId, productIds))
        )
        .groupBy(bids.productId),

      db
        .select({
          productId: watchLists.productId,
          value: count(),
        })
        .from(watchLists)
        .where(inArray(watchLists.productId, productIds))
        .groupBy(watchLists.productId),
    ]);

    // =====================================================
    // ============ Get Current Price + Winner =============
    // =====================================================

    // --- Step 1: Subquery lấy MAX(amount) cho từng product ---
    const maxBidSub = db
      .select({
        productId: bids.productId,
        maxAmount: sql`MAX(${bids.amount})`.as("maxAmount"),
      })
      .from(bids)
      .where(eq(bids.status, "VALID"))
      .groupBy(bids.productId)
      .as("maxBid");

    // --- Step 2: Join để lấy tên người bid cao nhất ---
    const currentPricesAndBidders = await db
      .select({
        productId: maxBidSub.productId,
        currentPrice: maxBidSub.maxAmount,
        currentWinnerName: users.fullName,
      })
      .from(maxBidSub)
      .leftJoin(
        bids,
        and(
          eq(bids.productId, maxBidSub.productId),
          eq(bids.amount, maxBidSub.maxAmount),
          eq(bids.status, "VALID")
        )
      )
      .leftJoin(users, eq(users.id, bids.userId))
      .where(inArray(maxBidSub.productId, productIds));

    // ===== User watch set =====
    let userWatchSet = new Set<string>();
    if (userId) {
      const watchRows = await db.query.watchLists.findMany({
        where: and(
          eq(watchLists.userId, userId),
          inArray(watchLists.productId, productIds)
        ),
      });
      userWatchSet = new Set(watchRows.map((w) => w.productId));
    }

    // ===== Helper =====
    const maskName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return "****";
      const last = parts[parts.length - 1];
      return "****" + last;
    };

    // ===== Lookup maps =====
    const categoryMap = new Map(categoriesRows.map((c) => [c.id, c]));
    const sellerMap = new Map(sellersRows.map((s) => [s.id, s]));
    const imageMap = new Map(mainImages.map((i) => [i.productId, i]));
    const bidMap = new Map(
      bidCounts.map((r) => [r.productId, Number(r.value)])
    );
    const watchMap = new Map(
      watchCounts.map((r) => [r.productId, Number(r.value)])
    );
    const currentMap = new Map(
      currentPricesAndBidders.map((r) => [
        r.productId,
        {
          price: r.currentPrice ? String(r.currentPrice) : null,
          winner: r.currentWinnerName ? maskName(r.currentWinnerName) : null,
        },
      ])
    );

    // ===== Final enrichment =====
    return productsList.map((p) => {
      const cur = currentMap.get(p.id);

      return {
        ...p,
        categoryName: categoryMap.get(p.categoryId)?.name ?? "",
        sellerName: sellerMap.get(p.sellerId)?.fullName ?? "",
        sellerAvatarUrl: sellerMap.get(p.sellerId)?.avatarUrl ?? null,

        currentPrice: cur?.price ?? String(p.startPrice),
        currentWinnerName: cur?.winner ?? null,

        bidCount: bidMap.get(p.id) ?? 0,
        watchCount: watchMap.get(p.id) ?? 0,
        mainImageUrl: imageMap.get(p.id)?.imageUrl ?? null,

        isWatching: userId ? userWatchSet.has(p.id) : null,
      };
    });
  }
}

export const productService = new ProductService();
