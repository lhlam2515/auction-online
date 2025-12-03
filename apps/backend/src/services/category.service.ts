import { CategoryTree } from "@repo/shared-types";
import { eq } from "drizzle-orm";

import { db } from "@/config/database";
import { categories } from "@/models";
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
    // TODO: build hierarchical category tree
    const allCategories = await this.getAll();
    return this.buildTree(allCategories);
  }

  async getProductsByCategory(categoryId: string) {
    // TODO: fetch products filtered by category
    await this.getById(categoryId); // validate category exists
    return [];
  }

  private buildTree(
    categories: any[],
    parentId: string | null = null
  ): CategoryTree[] {
    // TODO: implement recursive tree building
    return [];
  }
}

export const categoryService = new CategoryService();
