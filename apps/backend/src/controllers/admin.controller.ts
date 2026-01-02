import type {
  AdminStats,
  GetUsersParams,
  BanUserRequest,
  ResetUserPasswordRequest,
  UpgradeRequest,
  ProcessUpgradeRequest,
  AdminGetProductsParams,
  RejectProductRequest,
  SuspendProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Category,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { categoryService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get dashboard statistics
    throw new NotImplementedError("Get dashboard stats not implemented yet");
  }
);

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetUsersParams;
    // TODO: Get all users with filters
    throw new NotImplementedError("Get users not implemented yet");
  }
);

export const toggleBanUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as BanUserRequest;
    // TODO: Ban/unban user
    throw new NotImplementedError("Toggle ban user not implemented yet");
  }
);

export const resetUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ResetUserPasswordRequest;
    // TODO: Reset user password
    throw new NotImplementedError("Reset user password not implemented yet");
  }
);

export const getUpgradeRequests = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get upgrade requests
    throw new NotImplementedError("Get upgrade requests not implemented yet");
  }
);

export const approveUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ProcessUpgradeRequest;
    // TODO: Approve upgrade request
    throw new NotImplementedError("Approve upgrade not implemented yet");
  }
);

export const rejectUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ProcessUpgradeRequest;
    // TODO: Reject upgrade request
    throw new NotImplementedError("Reject upgrade not implemented yet");
  }
);

export const getAllProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as AdminGetProductsParams;
    // TODO: Get all products
    throw new NotImplementedError("Get all products not implemented yet");
  }
);

export const getPendingProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as AdminGetProductsParams;
    // TODO: Get pending products
    throw new NotImplementedError("Get pending products not implemented yet");
  }
);

export const approveProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Approve product
    throw new NotImplementedError("Approve product not implemented yet");
  }
);

export const rejectProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as RejectProductRequest;
    // TODO: Reject product
    throw new NotImplementedError("Reject product not implemented yet");
  }
);

export const suspendProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as SuspendProductRequest;
    // TODO: Suspend active product
    throw new NotImplementedError("Suspend product not implemented yet");
  }
);

export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateCategoryRequest;
    // Create new category
    const newCategory = await categoryService.createCategory(
      body.name,
      body.parentId
    );
    return ResponseHandler.sendSuccess<Category>(res, newCategory, 201);
  }
);

export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateCategoryRequest;
    // Update category
    const updatedCategory = await categoryService.updateCategory(
      req.params.id,
      body.name
    );
    return ResponseHandler.sendSuccess<Category>(res, updatedCategory);
  }
);

export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    await categoryService.deleteCategory(categoryId);
    return ResponseHandler.sendSuccess(res, null, 200);
  }
);
