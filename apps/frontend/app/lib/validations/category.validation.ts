import { z } from "zod";

import { commonValidations } from "./common.validation";

/**
 * Category creation validation schema
 * @description Validates category creation form
 */
export const createCategorySchema = z.object({
  name: commonValidations.requiredString(2, "Tên danh mục tối thiểu 2 ký tự"),
  parentId: z.string().optional(),
});

/**
 * Category update validation schema
 * @description Validates category update form
 */
export const updateCategorySchema = z.object({
  name: commonValidations.requiredString(2, "Tên danh mục tối thiểu 2 ký tự"),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
