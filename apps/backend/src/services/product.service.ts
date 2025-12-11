import type {
  CreateProductRequest,
  SearchProductsParams,
  PaginatedResponse,
  UpdateDescriptionResponse,
  ProductImage,
  Product,
  TopListingResponse,
  ProductListing,
  GetSellerProductsParams,
} from "@repo/shared-types";
import { eq, desc, and, asc, count, sql, gt, inArray, not } from "drizzle-orm";
import slug from "slug";

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
import { toPaginated } from "@/utils/pagination";

export class ProductService {
  // async search(params: ProductSearchParams): Promise<PaginatedResponse<any>> {
  //   // TODO: build query dynamically based on filters and paginate
  //   return {
  //     items: [],
  //     pagination: {
  //       page: params.page || 1,
  //       limit: params.limit || 10,
  //       total: 0,
  //       totalPages: 0,
  //     },
  //   };
  // }

  async searchProducts(
    params: SearchProductsParams
  ): Promise<PaginatedResponse<ProductListing>> {
    const {
      q,
      categoryId,
      minPrice,
      maxPrice,
      status = "ACTIVE",
      sort = "newest",
      page = 1,
      limit = 10,
    } = params;

    const offset = (page - 1) * limit;

    // Build base query conditions
    const conditions = [];

    // Full text search using PostgreSQL's built-in FTS
    if (q?.trim()) {
      const searchTerm = q.trim();
      // Use the FTS index from products.model.ts
      conditions.push(
        sql`to_tsvector('simple', ${products.name} || ' ' || COALESCE(${products.description}, '')) @@ websearch_to_tsquery('simple', ${searchTerm})`
      );
    }

    // Category filter
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    // Status filter (default to ACTIVE if not specified)
    conditions.push(eq(products.status, status));

    // Create subquery for max bid amounts
    const maxBidSub = db
      .select({
        productId: bids.productId,
        maxAmount: sql`MAX(${bids.amount})`.as("maxAmount"),
      })
      .from(bids)
      .where(eq(bids.status, "VALID"))
      .groupBy(bids.productId)
      .as("maxBid");

    // Build the base query
    const baseQuery = db
      .select({
        product: products,
        currentPrice:
          sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice})`.as(
            "currentPrice"
          ),
      })
      .from(products)
      .leftJoin(maxBidSub, eq(maxBidSub.productId, products.id))
      .$dynamic();

    // Apply WHERE conditions
    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Price range filter (applied as HAVING after GROUP BY from subquery)
    const priceConditions = [];
    if (minPrice !== undefined) {
      priceConditions.push(
        sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice}) >= ${minPrice}`
      );
    }
    if (maxPrice !== undefined) {
      priceConditions.push(
        sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice}) <= ${maxPrice}`
      );
    }

    const queryWithHaving =
      priceConditions.length > 0
        ? queryWithWhere.having(and(...priceConditions))
        : queryWithWhere;

    // Apply sorting
    let finalQuery;
    switch (sort) {
      case "price_asc":
        finalQuery = queryWithHaving.orderBy(
          asc(sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice})`)
        );
        break;
      case "price_desc":
        finalQuery = queryWithHaving.orderBy(
          desc(sql`COALESCE(${maxBidSub.maxAmount}, ${products.startPrice})`)
        );
        break;
      case "ending_soon":
        finalQuery = queryWithHaving.orderBy(asc(products.endTime));
        break;
      case "newest":
      default:
        finalQuery = queryWithHaving.orderBy(desc(products.createdAt));
        break;
    }

    // Build count query with same conditions
    const baseCountQuery = db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(maxBidSub, eq(maxBidSub.productId, products.id))
      .$dynamic();

    const countQueryWithWhere =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

    const countQuery =
      priceConditions.length > 0
        ? countQueryWithWhere.having(and(...priceConditions))
        : countQueryWithWhere;

    // Execute queries
    const [results, countResult] = await Promise.all([
      finalQuery.limit(limit).offset(offset),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count) || 0;

    // Extract products and enrich them
    const productsList = results.map((r) => r.product);
    const enrichedProducts = await this.enrichProducts(productsList);

    return toPaginated(enrichedProducts, page, limit, total);
  }

  async getSellerProducts(
    sellerId: string,
    params: GetSellerProductsParams
  ): Promise<PaginatedResponse<ProductListing>> {
    const { page = 1, limit = 10, status } = params;
    const offset = (page - 1) * limit;

    // Build base query conditions
    const conditions = [eq(products.sellerId, sellerId)];
    if (status) {
      conditions.push(eq(products.status, status));
    }
    const results = await db.query.products.findMany({
      where: and(...conditions),
      limit,
      offset,
    });
    const total = await db
      .select({ value: count() })
      .from(products)
      .where(and(...conditions))
      .then((res) => Number(res[0]?.value) || 0);
    const enriched = await this.enrichProducts(results);
    return toPaginated(enriched, page, limit, total);
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

  async getRelatedProducts(
    productId: string,
    limit: number
  ): Promise<ProductListing[]> {
    // implement related products by category
    const product = await this.getById(productId);

    const relatedProducts = await db.query.products.findMany({
      where: and(
        eq(products.categoryId, product.categoryId),
        not(eq(products.id, productId)),
        eq(products.status, "ACTIVE")
      ),
      limit: limit,
    });
    const enriched = await this.enrichProducts(relatedProducts);

    return enriched;
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const product = await this.getById(productId);

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

    // ensure seller exists
    const seller = await db.query.users.findFirst({
      where: eq(users.id, sellerId),
    });
    if (!seller) throw new NotFoundError("Seller");

    // ensure category exists
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    if (!category) throw new NotFoundError("Category");

    if (new Date(endTime) <= new Date(startTime)) {
      throw new BadRequestError("End time must be after start time");
    }

    const nameTrimmed = name.trim();
    const baseSlug = slug(nameTrimmed);
    let slugifiedName = baseSlug;
    let i = 0;
    while (true) {
      const exists = await db.query.products.findFirst({
        where: eq(products.slug, slugifiedName),
      });
      if (!exists) break;
      i += 1;
      slugifiedName = `${baseSlug}-${i}`;
    }

    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          sellerId,
          categoryId,
          name: nameTrimmed,
          slug: slugifiedName,
          description: description.trim(),
          startPrice: Number(startPrice),
          stepPrice: Number(stepPrice),
          buyNowPrice: buyNowPrice != null ? Number(buyNowPrice) : null,
          status: "ACTIVE",
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isAutoExtend: isAutoExtend ?? true,
        } as any)
        .returning();

      // insert product images
      const imageRows = images.map((url, idx) => ({
        productId: created.id,
        imageUrl: url,
        altText: `${name} ${idx + 1}`,
        displayOrder: idx + 1,
        isMain: idx === 0,
      }));
      await tx.insert(productImages).values(imageRows);

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
    // Return updated product
    return this.getById(productId);
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

    // ===== Current winner names =====
    const currentWinnerName = await db
      .select({
        productId: products.id,
        currentWinnerName: users.fullName,
      })
      .from(products)
      .leftJoin(users, eq(products.winnerId, users.id))
      .where(inArray(products.id, productIds));

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
      if (parts.length === 0) return "****";
      if (parts.length === 1) return "****";
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
    const currentWinnerMap = new Map(
      currentWinnerName.map((r) => [
        r.productId,
        {
          winner: r.currentWinnerName ? maskName(r.currentWinnerName) : null,
        },
      ])
    );

    // ===== Final enrichment =====
    return productsList.map((p) => {
      return {
        ...p,
        categoryName: categoryMap.get(p.categoryId)?.name ?? "",
        sellerName: sellerMap.get(p.sellerId)?.fullName ?? "",
        sellerAvatarUrl: sellerMap.get(p.sellerId)?.avatarUrl ?? null,

        currentPrice: p.currentPrice ?? p.startPrice,
        currentWinnerName: currentWinnerMap.get(p.id)?.winner ?? null,
        winnerId: null, // hide winnerId in listing

        bidCount: bidMap.get(p.id) ?? 0,
        watchCount: watchMap.get(p.id) ?? 0,
        mainImageUrl: imageMap.get(p.id)?.imageUrl ?? null,

        isWatching: userId ? userWatchSet.has(p.id) : null,
      };
    });
  }
}

export const productService = new ProductService();
