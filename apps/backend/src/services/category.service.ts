import { db } from "@/config/database";
import { categories } from "@/models";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/utils/errors";

export interface CategoryTree {
  id: string;
  name: string;
  parentId: string | null;
  children?: CategoryTree[];
}

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
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        children: this.buildTree(categories, cat.id),
      }));
  }
}

export const categoryService = new CategoryService();
