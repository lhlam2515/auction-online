import type {
  Product,
  Category,
  CategoryTree,
  GetCategoryProductsParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { count, eq, inArray } from "drizzle-orm";
import slug from "slug";

import { db } from "@/config/database";
import { categories, products } from "@/models";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

export class CategoryService {
  async getAll() {
    return await db.select().from(categories);
  }

  async getById(categoryId: string) {
    const result = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    if (!result) throw new NotFoundError("Category");
    return result;
  }

  async getTree(): Promise<CategoryTree[]> {
    // build hierarchical category tree
    const allCategories = await this.getAll();
    return this.buildTree(allCategories);
  }

  async getProductsByCategory(
    categoryId: string,
    params: GetCategoryProductsParams
  ): Promise<PaginatedResponse<Product>> {
    // fetch products filtered by category
    await this.getById(categoryId); // validate category exists
    const { page = 1, limit = 20, sort } = params;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    const childrenCategories = await db.query.categories.findMany({
      where: eq(categories.parentId, categoryId),
      columns: { id: true },
    });
    const categoryIds = [
      categoryId,
      ...childrenCategories.map((cat) => cat.id),
    ];

    const result = await db.query.products.findMany({
      where: inArray(products.categoryId, categoryIds),

      orderBy: (p, { asc, desc }) => {
        if (sort === "price_asc") {
          return [asc(p.startPrice)];
        } else if (sort === "price_desc") {
          return [desc(p.startPrice)];
        } else if (sort === "ending_soon") {
          return [asc(p.endTime)];
        } else if (sort === "newest") {
          return [desc(p.startTime)];
        }

        return [];
      },

      limit,
      offset,
    });

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(products)
      .where(inArray(products.categoryId, categoryIds));

    return toPaginated(result, total, page, limit);
  }

  async createCategory(name: string, parentId?: string): Promise<Category> {
    let parentCategories = null;
    if (parentId) {
      parentCategories = await this.getById(parentId);
    }
    const level = parentCategories ? parentCategories.level + 1 : 0;
    if (level >= 2) {
      throw new BadRequestError("Không thể tạo danh mục con quá cấp 2");
    }

    const slugifiedName = await this.slugifiedCategoryName(name);

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        slug: slugifiedName,
        parentId: parentId || null,
        level,
      })
      .returning();

    return newCategory;
  }

  async updateCategory(categoryId: string, name: string): Promise<Category> {
    const category = await this.getById(categoryId);

    // ----- Name + slug handling -----
    const nameChanged = name.trim() !== category.name.trim();

    const newName = nameChanged ? name : category.name;
    const newSlug = nameChanged
      ? await this.slugifiedCategoryName(name)
      : category.slug;

    // ----- Update DB -----
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: newName,
        slug: newSlug,
        updatedAt: nameChanged ? new Date() : category.updatedAt,
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return updatedCategory;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.getById(categoryId);

    // Check for child categories
    const childCount = await db
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.parentId, categoryId));
    if (childCount[0].value > 0) {
      throw new BadRequestError("Không thể xóa danh mục có danh mục con");
    }

    // Check for associated products
    const productCount = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    if (productCount[0].value > 0) {
      throw new BadRequestError("Không thể xóa danh mục đang có sản phẩm");
    }

    // Proceed to delete
    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  private async slugifiedCategoryName(name: string) {
    const baseSlug = slug(name);
    let slugifiedName = baseSlug;
    let i = 0;
    while (true) {
      const exists = await db.query.categories.findFirst({
        where: eq(categories.slug, slugifiedName),
      });
      if (!exists) break;
      i += 1;
      slugifiedName = `${baseSlug}-${i}`;
    }
    return slugifiedName;
  }

  private buildTree(
    categories: any[],
    parentId: string | null = null
  ): CategoryTree[] {
    // implement recursive tree building
    const parentCategories = categories.filter(
      (cat) => cat.parentId === parentId
    );

    return parentCategories.map((parent) => {
      const children = this.buildTree(categories, parent.id);
      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        level: parent.level,
        children: children,
      };
    });
  }
}

export const categoryService = new CategoryService();
