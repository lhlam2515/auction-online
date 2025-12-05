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
    // build hierarchical category tree
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
