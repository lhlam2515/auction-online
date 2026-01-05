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
  ProductDetails,
  ProductSortOption,
  AdminGetProductsParams,
} from "@repo/shared-types";
import {
  eq,
  desc,
  and,
  asc,
  count,
  sql,
  gt,
  inArray,
  not,
  or,
  lt,
  ne,
} from "drizzle-orm";
import slug from "slug";

import { db } from "@/config/database";
import {
  autoBids,
  bids,
  categories,
  orders,
  productImages,
  products,
  productUpdates,
  users,
  watchLists,
} from "@/models";
import { maskName } from "@/utils";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

import { emailService } from "./email.service";
import { orderService } from "./order.service";

export class ProductService {
  async getProductsAdmin(
    params: AdminGetProductsParams
  ): Promise<PaginatedResponse<ProductDetails>> {
    const { page = 1, limit = 20, status, q, categoryId } = params;
    const offset = (page - 1) * limit;

    // Build base query conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(products.status, status));
    }

    if (q?.trim()) {
      const searchTerm = q.trim();
      conditions.push(
        sql`to_tsvector('simple', ${products.name} || ' ' || COALESCE(${products.description}, '')) @@ websearch_to_tsquery('simple', ${searchTerm})`
      );
    }

    if (categoryId) {
      conditions.push(
        or(
          eq(products.categoryId, categoryId),
          eq(categories.parentId, categoryId)
        )
      );
    }

    // Build the base query
    const baseQuery = db
      .select({
        product: products,
        category: categories,
        seller: users,
        order: orders,
        productImage: productImages,
      })
      .from(products)
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isMain, true)
        )
      )
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(orders, eq(products.id, orders.productId))
      .$dynamic();

    // Apply WHERE conditions
    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Apply sorting
    const finalQuery = queryWithWhere
      .orderBy(asc(products.name))
      .limit(limit)
      .offset(offset);

    // Build count query with same conditions
    const baseCountQuery = db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

    // Execute queries
    const [results, countResult] = await Promise.all([finalQuery, countQuery]);

    const total = Number(countResult[0]?.count) || 0;

    const productsList: ProductDetails[] = results.map((r) => {
      return {
        ...r.product,
        mainImageUrl: r.productImage?.imageUrl ?? "",
        categoryName: r.category?.name ?? "",
        sellerName: r.seller?.fullName ?? "",
        sellerAvatarUrl: r.seller?.avatarUrl ?? "",
        sellerRatingScore: r.seller?.ratingScore ?? 0,
        sellerRatingCount: r.seller?.ratingCount ?? 0,
        orderId: r.order?.id ?? null,
      };
    });
    return toPaginated(productsList, page, limit, total);
  }

  async suspendProduct(productId: string): Promise<Product> {
    const product = await this.getById(productId);
    if (product.status !== "ACTIVE") {
      throw new BadRequestError("Chỉ có thể gỡ sản phẩm đang đấu giá");
    }

    const [result] = await db.transaction(async (tx) => {
      const productUpdate = await tx
        .update(products)
        .set({
          status: "SUSPENDED",
          currentPrice: null,
          winnerId: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      await tx.delete(watchLists).where(eq(watchLists.productId, productId));

      await tx
        .update(autoBids)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(autoBids.productId, productId));

      await tx
        .update(bids)
        .set({ status: "INVALID" })
        .where(eq(bids.productId, productId));

      return productUpdate;
    });

    return result;
  }

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
      conditions.push(
        or(
          eq(products.categoryId, categoryId),
          eq(categories.parentId, categoryId)
        )
      );
    }

    // Status filter (default to ACTIVE if not specified)
    conditions.push(eq(products.status, status));

    // Price filter
    if (minPrice) {
      conditions.push(
        sql`COALESCE(${products.currentPrice}, ${products.startPrice}) >= ${minPrice}`
      );
    }
    if (maxPrice) {
      conditions.push(
        sql`COALESCE(${products.currentPrice}, ${products.startPrice}) <= ${maxPrice}`
      );
    }
    // Build the base query
    const baseQuery = db
      .select({ product: products })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    // Apply WHERE conditions
    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Apply sorting
    let finalQuery;
    switch (sort) {
      case "price_asc":
        finalQuery = queryWithWhere.orderBy(
          asc(sql`COALESCE(${products.currentPrice}, ${products.startPrice})`)
        );
        break;
      case "price_desc":
        finalQuery = queryWithWhere.orderBy(
          desc(sql`COALESCE(${products.currentPrice}, ${products.startPrice})`)
        );
        break;
      case "ending_soon":
        finalQuery = queryWithWhere.orderBy(asc(products.endTime));
        break;
      case "newest":
      default:
        finalQuery = queryWithWhere.orderBy(desc(products.createdAt));
        break;
    }

    // Build count query with same conditions
    const baseCountQuery = db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

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
    const now = new Date();

    // Build base query conditions
    const conditions = [eq(products.sellerId, sellerId)];
    if (status) {
      if (status === "ENDED") {
        conditions.push(lt(products.endTime, now));
        conditions.push(ne(products.status, "PENDING"));
        conditions.push(ne(products.status, "ACTIVE"));
      } else {
        conditions.push(eq(products.status, status));
      }
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

  async getProductDetailsById(productId: string): Promise<ProductDetails> {
    const [productInfo] = await db
      .select({ products, categories, users, orders, productImages })
      .from(products)
      .where(eq(products.id, productId))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isMain, true)
        )
      )
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(orders, eq(products.id, orders.productId));

    if (!productInfo || productInfo.products.status === "SUSPENDED") {
      throw new NotFoundError("Product");
    }

    return {
      ...productInfo.products,
      mainImageUrl: productInfo.productImages?.imageUrl ?? "",
      categoryName: productInfo.categories?.name ?? "",
      sellerName: productInfo.users?.fullName ?? "[Người dùng đã bị xóa]",
      sellerAvatarUrl: productInfo.users?.avatarUrl ?? "",
      sellerRatingScore: productInfo.users?.ratingScore ?? 0,
      sellerRatingCount: productInfo.users?.ratingCount ?? 0,
      orderId: productInfo.orders?.id ?? null,
    };
  }

  async getTopListings(
    limit: number,
    userId?: string
  ): Promise<TopListingResponse> {
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

    const hotProducts = hotRows.map((r) => r.product);

    // --------------------------
    // 3️⃣ Highest price
    // --------------------------
    const highestRows = await db
      .select()
      .from(products)
      .where(activeAndNotEnded)
      .orderBy(
        desc(sql`COALESCE(${products.currentPrice}, ${products.startPrice})`)
      )
      .limit(limit);

    // --------------------------
    // 4️⃣ Tổng hợp tất cả products và enrich 1 lần
    // --------------------------
    const allProducts = new Map<string, Product>();

    // Add all products to map để loại bỏ duplicates
    endingSoonRows.forEach((p) => allProducts.set(p.id, p));
    hotProducts.forEach((p) => allProducts.set(p.id, p));
    highestRows.forEach((p) => allProducts.set(p.id, p));

    // Enrich tất cả products 1 lần
    const enrichedProducts = await this.enrichProducts(
      Array.from(allProducts.values()),
      userId
    );

    // Tạo map để lookup enriched products
    const enrichedMap = new Map(enrichedProducts.map((p) => [p.id, p]));

    // --------------------------
    // 5️⃣ Phân bổ lại kết quả cho từng category
    // --------------------------
    const listings: TopListingResponse = {
      endingSoon: endingSoonRows
        .map((p) => enrichedMap.get(p.id)!)
        .filter(Boolean),
      hot: hotProducts.map((p) => enrichedMap.get(p.id)!).filter(Boolean),
      highestPrice: highestRows
        .map((p) => enrichedMap.get(p.id)!)
        .filter(Boolean),
    };

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
    await this.getById(productId); // Validate product exists

    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
      orderBy: asc(productImages.displayOrder),
    });
    return images;
  }

  async getDescriptionUpdates(
    productId: string
  ): Promise<UpdateDescriptionResponse[]> {
    await this.getById(productId); // Validate product exists

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
      freeToBid,
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

    if (new Date(endTime) <= new Date()) {
      throw new BadRequestError("End time must be after current time");
    }

    if (startPrice % stepPrice !== 0) {
      throw new BadRequestError("Start price must be a multiple of step price");
    }

    if (buyNowPrice != null) {
      if (buyNowPrice < startPrice + stepPrice) {
        throw new BadRequestError(
          "Buy now price must be greater than start price + step price"
        );
      }
      if (buyNowPrice % stepPrice !== 0) {
        throw new BadRequestError(
          "Buy now price must be a multiple of step price"
        );
      }
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
          freeToBid,
          status: "ACTIVE",
          startTime: new Date(),
          endTime: new Date(endTime),
          isAutoExtend: isAutoExtend ?? true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        })
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

  async getBidders(productId: string) {
    const histories = await db.query.bids.findMany({
      where: and(eq(bids.productId, productId), eq(bids.status, "VALID")),
      with: { user: true },
    });

    // Deduplicate users by ID using JavaScript
    const userMap = new Map();
    histories.forEach((bid) => {
      if (bid.user) {
        userMap.set(bid.user.id, bid.user);
      }
    });
    return Array.from(userMap.values());
  }

  buildProductLink(productId: string): string {
    return `${process.env.FRONTEND_URL}/products/${productId}`;
  }

  async getWatchListByCard(
    userId: string,
    sort?: ProductSortOption
  ): Promise<ProductListing[]> {
    // const existingUser = await this.getById(userId); // ensure user exists

    const items = await db.query.watchLists.findMany({
      where: eq(watchLists.userId, userId),
      with: {
        product: true,
      },
    });

    const productsList: Product[] = items.map((item) => ({
      ...item.product,
      buyNowPrice: item.product.buyNowPrice ?? null,
      currentPrice: item.product.currentPrice ?? null,
    }));

    const enrichedProducts = await this.enrichProducts(productsList, userId);

    if (sort) {
      enrichedProducts.sort((a, b) => {
        switch (sort) {
          case "price_asc":
            return Number(a.currentPrice || 0) - Number(b.currentPrice || 0);
          case "price_desc":
            return Number(b.currentPrice || 0) - Number(a.currentPrice || 0);
          case "ending_soon":
            return (
              new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
            );
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
    }

    return enrichedProducts;
  }

  async buyNow(productId: string, buyerId: string) {
    const result = await db.transaction(async (tx) => {
      // 1. Transaction & Locking
      // LOCK: Khóa dòng sản phẩm (quan trọng nhất)
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for("update");

      if (!product) throw new NotFoundError("Sản phẩm không tồn tại");

      // 2. Validate điều kiện Mua Ngay
      if (!product.buyNowPrice) {
        throw new BadRequestError(
          "Sản phẩm này không hỗ trợ tính năng Mua Ngay"
        );
      }

      const buyNowPrice = Number(product.buyNowPrice);

      if (product.sellerId === buyerId) {
        throw new BadRequestError("Không thể tự mua sản phẩm của chính mình");
      }

      if (product.status !== "ACTIVE") {
        throw new BadRequestError("Sản phẩm không còn khả dụng để mua");
      }

      const now = new Date();
      if (product.endTime < now) {
        throw new BadRequestError("Phiên đấu giá đã kết thúc");
      }

      // 3. Thực hiện hành động Mua (Chốt đơn)

      // Update sản phẩm thành SOLD ngay lập tức
      await tx
        .update(products)
        .set({
          status: "SOLD", // Chốt trạng thái
          winnerId: buyerId, // Người mua là người thắng
          currentPrice: buyNowPrice.toString(), // Giá chốt là giá BuyNow
          endTime: now, // Kết thúc ngay lúc này
          updatedAt: now,
        })
        .where(eq(products.id, productId));

      // Vô hiệu hóa tất cả AutoBid (vì game đã over)
      await tx
        .update(autoBids)
        .set({ isActive: false, updatedAt: now })
        .where(
          and(eq(autoBids.productId, productId), eq(autoBids.isActive, true))
        );

      // Tạo Order ngay lập tức
      // sellerId đã được kiểm tra không null ở trên
      const newOrder = await orderService.createFromAuction(
        productId,
        buyerId,
        product.sellerId!, // Safe because we checked above
        buyNowPrice,
        true, // isBuyNow = true
        tx
      );

      // Lấy thông tin user để gửi mail
      const [buyer, seller] = await Promise.all([
        tx.query.users.findFirst({ where: eq(users.id, buyerId) }),
        product.sellerId
          ? tx.query.users.findFirst({ where: eq(users.id, product.sellerId) })
          : Promise.resolve(null),
      ]);

      if (buyer && seller) {
        return {
          newOrderId: newOrder.id,
          sellerEmail: seller.email,
          buyerEmail: buyer.email,
          buyerName: buyer.fullName,
          productName: product.name,
          price: buyNowPrice,
        };
      }
    });

    // 4. Xử lý sau Transaction (Gửi Email)
    if (result) {
      const link = productService.buildProductLink(productId);

      // Gửi mail cho Seller
      emailService.notifyProductSold(
        result.sellerEmail,
        result.productName,
        result.price,
        result.buyerName,
        link
      );

      // Gửi mail xác nhận cho người mua
      emailService.notifyBuyNowSuccess(
        result.buyerEmail,
        result.productName,
        result.price,
        link
      );

      // Gửi mail cho những người đã tham gia đấu giá nhưng thua
      const bidders = await productService.getBidders(productId);
      const bidderEmails = bidders
        .filter((b) => b.id !== buyerId)
        .map((b) => b.email);

      emailService.notifyBuyNowOthers(
        bidderEmails,
        result.productName,
        result.price,
        link
      );
    }

    return {
      newOrderId: result?.newOrderId,
      message: "Mua ngay thành công",
      orderCreated: true,
    };
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
    const sellerIds = [
      ...new Set(
        productsList
          .map((p) => p.sellerId)
          .filter((id): id is string => id !== null)
      ),
    ];

    // ===== Batch fetch: categories & sellers =====
    const [categoriesRows, sellersRows] = await Promise.all([
      db.query.categories.findMany({
        where: inArray(categories.id, categoryIds),
      }),
      sellerIds.length > 0
        ? db.query.users.findMany({
            where: inArray(users.id, sellerIds),
          })
        : Promise.resolve([]),
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
      const seller = p.sellerId ? sellerMap.get(p.sellerId) : null;
      return {
        ...p,
        categoryName: categoryMap.get(p.categoryId)?.name ?? "",
        sellerName: seller?.fullName ?? null,
        sellerAvatarUrl: seller?.avatarUrl ?? null,

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
