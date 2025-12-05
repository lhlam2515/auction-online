import {
  CategoryTree,
  GetCategoryProductsParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { count, eq } from "drizzle-orm";

import { db } from "@/config/database";
import { categories, products } from "@/models";
import { NotFoundError } from "@/utils/errors";

export class CategoryService {
  async getAll() {
    return await db.select().from(categories);
  }

  async getById(categoryId: string) {
    const result = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    if (!result) throw new NotFoundError("Category not found");
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

    const result = await db.query.products.findMany({
      where: eq(products.categoryId, categoryId),

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
