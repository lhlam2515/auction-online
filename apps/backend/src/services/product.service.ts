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
  productQuestions,
  products,
  productUpdates,
  users,
  watchLists,
} from "@/models";
import { generateRandomSuffix, maskName } from "@/utils";
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
  /**
   * Lấy danh sách sản phẩm cho admin với filters và pagination
   */
  async getProductsAdmin(
    params: AdminGetProductsParams
  ): Promise<PaginatedResponse<ProductDetails>> {
    const { page = 1, limit = 20, status, q, categoryId } = params;
    const offset = (page - 1) * limit;

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

    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const finalQuery = queryWithWhere
      .orderBy(asc(products.name))
      .limit(limit)
      .offset(offset);

    const baseCountQuery = db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

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

  /**
   * Gỡ sản phẩm (suspend) - chỉ admin có thể thực hiện
   * Sử dụng transaction với row-level locking để tránh race condition
   */
  async suspendProduct(productId: string): Promise<Product> {
    return await db.transaction(async (tx) => {
      const [product] = await tx
        .select({ status: products.status })
        .from(products)
        .where(eq(products.id, productId))
        .for("update");

      if (!product) {
        throw new NotFoundError("Không tìm thấy sản phẩm");
      }

      if (product.status !== "ACTIVE") {
        throw new BadRequestError("Chỉ có thể gỡ sản phẩm đang đấu giá");
      }

      const [updated] = await tx
        .update(products)
        .set({
          status: "SUSPENDED",
          currentPrice: null,
          winnerId: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      await Promise.all([
        tx.delete(watchLists).where(eq(watchLists.productId, productId)),
        tx
          .update(autoBids)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(autoBids.productId, productId)),
        tx
          .update(bids)
          .set({ status: "INVALID" })
          .where(eq(bids.productId, productId)),
      ]);

      return updated;
    });
  }

  /**
   * Tìm kiếm sản phẩm với filters, sorting và pagination
   */
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

    const conditions = [];

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

    conditions.push(eq(products.status, status));

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

    const baseQuery = db
      .select({ product: products })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

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

    const baseCountQuery = db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .$dynamic();

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

    const [results, countResult] = await Promise.all([
      finalQuery.limit(limit).offset(offset),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count) || 0;

    const productsList = results.map((r) => r.product);
    const enrichedProducts = await this.enrichProducts(productsList);

    return toPaginated(enrichedProducts, page, limit, total);
  }

  /**
   * Lấy danh sách sản phẩm của một seller
   */
  async getSellerProducts(
    sellerId: string,
    params: GetSellerProductsParams
  ): Promise<PaginatedResponse<ProductListing>> {
    const { page = 1, limit = 10, status } = params;
    const offset = (page - 1) * limit;
    const now = new Date();

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

  /**
   * Lấy sản phẩm theo ID (basic info)
   */
  async getById(productId: string): Promise<Product> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!result) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }
    return result;
  }

  /**
   * Lấy chi tiết đầy đủ của sản phẩm (có join với các bảng liên quan)
   */
  async getProductDetailsById(productId: string): Promise<ProductDetails> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        images: {
          where: eq(productImages.isMain, true),
          columns: { imageUrl: true },
        },
        category: { columns: { name: true } },
        seller: true,
        orders: { columns: { id: true } },
      },
    });

    if (!product || product.status === "SUSPENDED") {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }

    const { images, category, seller, orders, ...rest } = product;
    return {
      ...rest,
      mainImageUrl: images[0]?.imageUrl ?? "",
      categoryName: category?.name ?? "",
      sellerName: seller?.fullName ?? "[Người dùng đã bị xóa]",
      sellerAvatarUrl: seller?.avatarUrl ?? "",
      sellerRatingScore: seller?.ratingScore ?? 0,
      sellerRatingCount: seller?.ratingCount ?? 0,
      orderId: orders[0]?.id ?? null,
    };
  }

  /**
   * Lấy danh sách sản phẩm nổi bật (ending soon, hot, highest price)
   */
  async getTopListings(
    limit: number,
    userId?: string
  ): Promise<TopListingResponse> {
    const now = new Date();

    const activeAndNotEnded = and(
      eq(products.status, "ACTIVE"),
      gt(products.endTime, now)
    );

    const [endingSoonRows, highestRows, hotRows] = await Promise.all([
      db.query.products.findMany({
        where: activeAndNotEnded,
        orderBy: asc(products.endTime),
        limit,
      }),
      db.query.products.findMany({
        where: activeAndNotEnded,
        orderBy: desc(
          sql`COALESCE(${products.currentPrice}, ${products.startPrice})`
        ),
        limit,
      }),
      db
        .select({ product: products })
        .from(products)
        .leftJoin(
          bids,
          and(eq(bids.productId, products.id), eq(bids.status, "VALID"))
        )
        .where(activeAndNotEnded)
        .groupBy(products.id)
        .orderBy(desc(count(bids.id)))
        .limit(limit),
    ]);

    const hotProducts = hotRows.map((r) => r.product);

    const allProducts = new Map<string, Product>();

    endingSoonRows.forEach((p) => allProducts.set(p.id, p));
    hotProducts.forEach((p) => allProducts.set(p.id, p));
    highestRows.forEach((p) => allProducts.set(p.id, p));

    const enrichedProducts = await this.enrichProducts(
      Array.from(allProducts.values()),
      userId
    );

    const enrichedMap = new Map(enrichedProducts.map((p) => [p.id, p]));

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

  /**
   * Lấy các sản phẩm liên quan (cùng category)
   */
  async getRelatedProducts(
    productId: string,
    limit: number
  ): Promise<ProductListing[]> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { categoryId: true },
    });

    if (!product) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }

    const relatedProducts = await db.query.products.findMany({
      where: and(
        eq(products.categoryId, product.categoryId),
        not(eq(products.id, productId)),
        eq(products.status, "ACTIVE")
      ),
      limit,
    });
    const enriched = await this.enrichProducts(relatedProducts);

    return enriched;
  }

  /**
   * Lấy danh sách hình ảnh của sản phẩm
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }

    return product.images;
  }

  /**
   * Lấy lịch sử cập nhật mô tả của sản phẩm
   */
  async getDescriptionUpdates(
    productId: string
  ): Promise<UpdateDescriptionResponse[]> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        updates: {
          orderBy: (updates, { asc }) => [asc(updates.createdAt)],
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }

    return product.updates;
  }

  /**
   * Tạo sản phẩm mới
   * Sử dụng transaction để đảm bảo data consistency
   */
  async create(sellerId: string, data: CreateProductRequest): Promise<Product> {
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

    const seller = await db.query.users.findFirst({
      where: eq(users.id, sellerId),
      columns: { id: true },
    });
    if (!seller) {
      throw new NotFoundError("Không tìm thấy người bán");
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      columns: { id: true },
    });
    if (!category) {
      throw new NotFoundError("Không tìm thấy danh mục");
    }

    if (new Date(endTime) <= new Date()) {
      throw new BadRequestError(
        "Thời gian kết thúc phải sau thời gian hiện tại"
      );
    }

    if (startPrice % stepPrice !== 0) {
      throw new BadRequestError("Giá khởi điểm phải là bội số của bước giá");
    }

    if (buyNowPrice != null) {
      if (buyNowPrice < startPrice + stepPrice) {
        throw new BadRequestError(
          "Giá mua ngay phải lớn hơn giá khởi điểm cộng bước giá"
        );
      }
      if (buyNowPrice % stepPrice !== 0) {
        throw new BadRequestError("Giá mua ngay phải là bội số của bước giá");
      }
    }

    const nameTrimmed = name.trim();
    const baseSlug = slug(nameTrimmed);
    let slugifiedName = baseSlug;
    let maxRetries = 5;

    while (maxRetries > 0) {
      const suffix = generateRandomSuffix(4);
      const candidate = `${baseSlug}-${suffix}`;

      const isTaken = await db.query.products.findFirst({
        where: eq(products.slug, candidate),
        columns: { id: true },
      });

      if (!isTaken) {
        slugifiedName = candidate;
        break;
      }

      maxRetries--;
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

  /**
   * Xóa sản phẩm (chỉ khi không đang active)
   */
  async delete(productId: string, sellerId: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, sellerId: true, status: true },
    });

    if (!product) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenError("Không có quyền xóa sản phẩm này");
    }
    if (product.status === "ACTIVE") {
      throw new ConflictError("Không thể xóa sản phẩm đang đấu giá");
    }
    await db.delete(products).where(eq(products.id, productId));
  }

  /**
   * Cập nhật mô tả sản phẩm (thêm vào history)
   * Sử dụng transaction để đảm bảo consistency
   * Gửi email thông báo cho những người dùng liên quan (bidders và watchers)
   */
  async updateDescription(
    productId: string,
    sellerId: string,
    description: string
  ): Promise<UpdateDescriptionResponse> {
    const result = await db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
        columns: { id: true, sellerId: true, name: true },
      });

      if (!product) {
        throw new NotFoundError("Không tìm thấy sản phẩm");
      }

      if (product.sellerId !== sellerId) {
        throw new ForbiddenError("Không có quyền cập nhật sản phẩm này");
      }

      const [updatedContent] = await tx
        .insert(productUpdates)
        .values({
          productId,
          updatedBy: sellerId,
          content: description,
        })
        .returning();

      return {
        updatedContent,
        productName: product.name,
      };
    });

    // Gửi email thông báo sau khi transaction thành công
    const [bidders, watchers, askers] = await Promise.all([
      this.getBidders(productId),
      db.query.watchLists.findMany({
        where: eq(watchLists.productId, productId),
        with: { user: true },
      }),
      db.query.productQuestions.findMany({
        where: eq(productQuestions.productId, productId),
        with: { asker: true },
      }),
    ]);

    // Tập hợp email của người dùng liên quan (không gửi cho chính seller)
    const emailSet = new Set<string>();

    bidders.forEach((bidder) => {
      if (bidder.id !== sellerId) {
        emailSet.add(bidder.email);
      }
    });

    watchers.forEach((watcher) => {
      if (watcher.user && watcher.userId !== sellerId) {
        emailSet.add(watcher.user.email);
      }
    });

    askers.forEach((question) => {
      if (question.asker && question.asker.id !== sellerId) {
        emailSet.add(question.asker.email);
      }
    });

    const emails = Array.from(emailSet);

    // Gửi email nếu có người dùng liên quan
    if (emails.length > 0) {
      const productLink = this.buildProductLink(productId);
      await emailService.notifyProductDescriptionUpdate(
        emails,
        result.productName,
        description,
        productLink
      );
    }

    return result.updatedContent;
  }

  /**
   * Bật/tắt auto-extend cho sản phẩm
   * Sử dụng transaction để đảm bảo consistency
   */
  async setAutoExtend(
    productId: string,
    sellerId: string,
    isAutoExtend: boolean
  ) {
    return await db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
        columns: { id: true, sellerId: true },
      });

      if (!product) {
        throw new NotFoundError("Không tìm thấy sản phẩm");
      }

      if (product.sellerId !== sellerId) {
        throw new ForbiddenError("Không có quyền cập nhật sản phẩm này");
      }

      const [updated] = await tx
        .update(products)
        .set({ isAutoExtend, updatedAt: new Date() })
        .where(eq(products.id, productId))
        .returning();

      return updated;
    });
  }

  /**
   * Lấy danh sách người đã đấu giá sản phẩm (unique users)
   */
  async getBidders(productId: string) {
    const histories = await db.query.bids.findMany({
      where: and(eq(bids.productId, productId), eq(bids.status, "VALID")),
      with: { user: true },
    });

    const userMap = new Map();
    histories.forEach((bid) => {
      if (bid.user) {
        userMap.set(bid.user.id, bid.user);
      }
    });
    return Array.from(userMap.values());
  }

  /**
   * Build link tới trang chi tiết sản phẩm
   */
  buildProductLink(productId: string): string {
    return `${process.env.FRONTEND_URL}/products/${productId}`;
  }

  /**
   * Lấy danh sách sản phẩm trong watchlist của user
   */
  async getWatchListByCard(
    userId: string,
    sort?: ProductSortOption
  ): Promise<ProductListing[]> {
    const items = await db.query.watchLists.findMany({
      where: eq(watchLists.userId, userId),
      with: { product: true },
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

  /**
   * Mua ngay sản phẩm
   * Sử dụng transaction với row-level locking để tránh race condition
   * Email notification được gửi sau khi transaction commit thành công
   */
  async buyNow(productId: string, buyerId: string) {
    const result = await db.transaction(async (tx) => {
      const [product] = await tx
        .select({
          id: products.id,
          sellerId: products.sellerId,
          status: products.status,
          endTime: products.endTime,
          buyNowPrice: products.buyNowPrice,
          name: products.name,
        })
        .from(products)
        .where(eq(products.id, productId))
        .for("update");

      if (!product) {
        throw new NotFoundError("Không tìm thấy sản phẩm");
      }

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

      await tx
        .update(products)
        .set({
          status: "SOLD",
          winnerId: buyerId,
          currentPrice: buyNowPrice.toString(),
          endTime: now,
          updatedAt: now,
        })
        .where(eq(products.id, productId));

      await tx
        .update(autoBids)
        .set({ isActive: false, updatedAt: now })
        .where(
          and(eq(autoBids.productId, productId), eq(autoBids.isActive, true))
        );

      const newOrder = await orderService.createFromAuction(
        productId,
        buyerId,
        product.sellerId!, // Safe because we checked above
        buyNowPrice,
        tx
      );

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

    if (result) {
      const link = productService.buildProductLink(productId);

      const emailPromises = [
        emailService.notifyProductSold(
          result.sellerEmail,
          result.productName,
          result.price,
          result.buyerName,
          link
        ),
        emailService.notifyBuyNowSuccess(
          result.buyerEmail,
          result.productName,
          result.price,
          link
        ),
      ];

      const bidders = await productService.getBidders(productId);
      const bidderEmails = bidders
        .filter((b) => b.id !== buyerId)
        .map((b) => b.email);

      if (bidderEmails.length > 0) {
        emailPromises.push(
          emailService.notifyBuyNowOthers(
            bidderEmails,
            result.productName,
            result.price,
            link
          )
        );
      }

      await Promise.all(emailPromises);
    }

    return {
      newOrderId: result?.newOrderId,
      message: "Mua ngay thành công",
      orderCreated: true,
    };
  }

  /**
   * Enrich products với thông tin bổ sung (category, seller, images, bids, etc.)
   * Sử dụng batch queries để tránh N+1 problem
   */
  private async enrichProducts(
    productsList: Product[],
    userId?: string
  ): Promise<ProductListing[]> {
    if (!productsList.length) return [];

    const productIds = productsList.map((p) => p.id);
    const categoryIds = [...new Set(productsList.map((p) => p.categoryId))];
    const sellerIds = [
      ...new Set(
        productsList
          .map((p) => p.sellerId)
          .filter((id): id is string => id !== null)
      ),
    ];

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

    const currentWinnerName = await db
      .select({
        productId: products.id,
        currentWinnerName: users.fullName,
      })
      .from(products)
      .leftJoin(users, eq(products.winnerId, users.id))
      .where(inArray(products.id, productIds));

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

    return productsList.map((p) => {
      const seller = p.sellerId ? sellerMap.get(p.sellerId) : null;
      return {
        ...p,
        categoryName: categoryMap.get(p.categoryId)?.name ?? "",
        sellerName: seller?.fullName ?? null,
        sellerAvatarUrl: seller?.avatarUrl ?? null,

        currentPrice: p.currentPrice ?? p.startPrice,
        currentWinnerName: currentWinnerMap.get(p.id)?.winner ?? null,
        winnerId: null,

        bidCount: bidMap.get(p.id) ?? 0,
        watchCount: watchMap.get(p.id) ?? 0,
        mainImageUrl: imageMap.get(p.id)?.imageUrl ?? null,

        isWatching: userId ? userWatchSet.has(p.id) : null,
      };
    });
  }
}

export const productService = new ProductService();
