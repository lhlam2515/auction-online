import type {
  Product,
  Category,
  CategoryTree,
  GetCategoryProductsParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { count, eq, inArray } from "drizzle-orm";
import type { PostgresError } from "postgres";
import slug from "slug";

import { db } from "@/config/database";
import { categories, products } from "@/models";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

type DbTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

export class CategoryService {
  async getAll() {
    return await db.select().from(categories);
  }

  async getById(categoryId: string) {
    const result = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    if (!result) throw new NotFoundError("Không tìm thấy danh mục");
    return result;
  }

  /**
   * Lấy cây danh mục (dữ liệu phân cấp)
   * Sử dụng thuật toán xây dựng cây từ danh sách phẳng với độ phức tạp O(n)
   */
  async getTree(): Promise<CategoryTree[]> {
    // 1. Lấy toàn bộ dữ liệu 1 lần duy nhất (Flat list)
    const allCategories = await this.getAll();
    if (allCategories.length === 0) return [];

    // 2. Sử dụng Map để truy xuất O(1)
    const categoryMap = new Map<string, CategoryTree>();
    const roots: CategoryTree[] = [];

    // Bước 2.1: Khởi tạo các node
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [], // Khởi tạo mảng rỗng
      });
    });

    // Bước 2.2: Ráp cha-con
    allCategories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        // Nếu cha tồn tại thì push vào children của cha
        if (parent) {
          parent.children!.push(node);
        } else {
          roots.push(node); // Xem như root nếu không tìm thấy cha (dữ liệu không nhất quán)
        }
      } else {
        // Không có parentId -> Là root
        roots.push(node);
      }
    });

    return roots;
  }

  async getProductsByCategory(
    categoryId: string,
    params: GetCategoryProductsParams
  ): Promise<PaginatedResponse<Product>> {
    const categoryExists = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      columns: { id: true },
    });
    if (!categoryExists) throw new NotFoundError("Không tìm thấy danh mục");

    const { page = 1, limit = 20, sort } = params;
    const offset = (page - 1) * limit;

    const childrenCategories = await db.query.categories.findMany({
      where: eq(categories.parentId, categoryId),
      columns: { id: true },
    });

    const targetCategoryIds = [
      categoryId,
      ...childrenCategories.map((cat) => cat.id),
    ];

    const whereCondition = inArray(products.categoryId, targetCategoryIds);

    const dataPromise = db.query.products.findMany({
      where: whereCondition,
      orderBy: (p, { asc, desc }) => {
        switch (sort) {
          case "price_asc":
            return [asc(p.startPrice)];
          case "price_desc":
            return [desc(p.startPrice)];
          case "ending_soon":
            return [asc(p.endTime)];
          case "newest":
            return [desc(p.startTime)];
          default:
            return [desc(p.createdAt)]; // Default sort an toàn
        }
      },
      limit,
      offset,
    });

    const countPromise = db
      .select({ value: count() })
      .from(products)
      .where(whereCondition);

    // Chạy song song 2 query
    const [result, countResult] = await Promise.all([
      dataPromise,
      countPromise,
    ]);

    return toPaginated(result, countResult[0].value, page, limit);
  }

  async createCategory(name: string, parentId?: string): Promise<Category> {
    return await db.transaction(async (tx) => {
      let level = 0;

      if (parentId) {
        const parent = await tx.query.categories.findFirst({
          where: eq(categories.id, parentId),
          columns: { id: true, level: true },
        });

        if (!parent) throw new NotFoundError("Không tìm thấy danh mục cha");
        level = parent.level + 1;
      }

      // Logic nghiệp vụ: Chặn độ sâu cây
      if (level >= 2) {
        throw new BadRequestError("Độ sâu danh mục tối đa là 2");
      }

      const slugifiedName = await this.generateUniqueSlug(name, tx);

      const [newCategory] = await tx
        .insert(categories)
        .values({
          name: name.trim(),
          slug: slugifiedName,
          parentId: parentId || null,
          level,
        })
        .returning();

      return newCategory;
    });
  }

  async updateCategory(categoryId: string, name: string): Promise<Category> {
    return await db.transaction(async (tx) => {
      const category = await tx.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });

      if (!category) throw new NotFoundError("Không tìm thấy danh mục");

      const trimmedName = name.trim();
      const isNameChanged = trimmedName !== category.name;

      if (!isNameChanged) return category;

      const newSlug = await this.generateUniqueSlug(trimmedName, tx);

      const [updatedCategory] = await tx
        .update(categories)
        .set({
          name: trimmedName,
          slug: newSlug,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, categoryId))
        .returning();

      return updatedCategory;
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Thử xóa trực tiếp
      const deletedResult = await db
        .delete(categories)
        .where(eq(categories.id, categoryId))
        .returning({ id: categories.id });

      if (deletedResult.length === 0) {
        throw new NotFoundError("Không tìm thấy danh mục");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Bắt lỗi ràng buộc khóa ngoại (Foreign Key Violation) từ Postgres
      // Mã lỗi 23503: foreign_key_violation
      const err = error.cause as PostgresError;
      if (err.code === "23503") {
        // Tùy vào tên constraint trong DB của bạn để thông báo chính xác
        // products_category_id_categories_id_fk và categories_parent_id_categories_id_fk
        const constraint = err.constraint_name || "";

        if (constraint.includes("parent_id")) {
          throw new BadRequestError(
            "Không thể xóa danh mục chứa danh mục con."
          );
        }
        if (
          constraint.includes("product") ||
          constraint.includes("category_id")
        ) {
          throw new BadRequestError("Không thể xóa danh mục chứa sản phẩm.");
        }

        throw new BadRequestError(
          "Không thể xóa danh mục vì nó được tham chiếu bởi dữ liệu khác."
        );
      }

      throw error;
    }
  }

  private async generateUniqueSlug(name: string, tx: DbTransaction) {
    const baseSlug = slug(name);
    let candidateSlug = baseSlug;
    let counter = 0;
    const maxRetries = 100; // Circuit breaker

    while (counter < maxRetries) {
      const existing = await tx.query.categories.findFirst({
        where: eq(categories.slug, candidateSlug),
        columns: { id: true },
      });

      if (!existing) return candidateSlug;

      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }

    throw new Error(
      "Không thể tạo slug duy nhất cho danh mục sau nhiều lần thử"
    );
  }
}

export const categoryService = new CategoryService();
