import {
  Category,
  CategoryTree,
  GetCategoryProductsParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { count, eq, inArray } from "drizzle-orm";
import slug from "slug";
import { boolean } from "zod";

import { db } from "@/config/database";
import { categories, products } from "@/models";
import { BadRequestError, NotFoundError } from "@/utils/errors";

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
  ): Promise<PaginatedResponse<any>> {
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
      .where(eq(products.categoryId, categoryId));

    return {
      items: result,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createCategory(name: string, parentId?: string): Promise<Category> {
    let parentCategories = null;
    if (parentId) {
      parentCategories = await this.getById(parentId);
    }
    const level = parentCategories ? parentCategories.level + 1 : 0;
    if (level >= 2) {
      throw new BadRequestError("Cannot create category deeper than level 2");
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

  async updateCategory(
    categoryId: string,
    name?: string,
    parentId?: string | null
  ): Promise<Category> {
    const category = await this.getById(categoryId);

    let isUpdated = false;

    // ----- Parent handling -----
    let newParentId = category.parentId;
    let newLevel = category.level;

    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === null) {
        newParentId = null;
        newLevel = 0;
        isUpdated = true;
      } else {
        const parent = await this.getById(parentId);

        if (parent.id === categoryId) {
          throw new BadRequestError("Category cannot be its own parent");
        }

        const level = parent.level + 1;
        if (level >= 2) {
          throw new BadRequestError("Cannot set category deeper than level 2");
        }

        newParentId = parentId;
        newLevel = level;
        isUpdated = true;
      }
    }

    // ----- Name + slug handling -----
    const nameChanged =
      name !== undefined && name.trim() !== category.name.trim();

    const newName = nameChanged ? name! : category.name;
    const newSlug = nameChanged
      ? await this.slugifiedCategoryName(name!)
      : category.slug;

    if (nameChanged) {
      isUpdated = true;
    }

    // ----- Update DB -----
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: newName,
        slug: newSlug,
        parentId: newParentId,
        level: newLevel,
        updatedAt: isUpdated ? new Date() : category.updatedAt,
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return updatedCategory;
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
