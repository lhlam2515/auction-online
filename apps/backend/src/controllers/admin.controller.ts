import type {
  AdminStats,
  AdminAnalytics,
  GetUsersParams,
  GetUpgradeRequestsParams,
  BanUserRequest,
  ResetUserPasswordRequest,
  UpdateUserInfoRequest,
  UpdateAccountStatusRequest,
  UpdateUserRoleRequest,
  AdminGetProductsParams,
  RejectProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateUserRequest,
  DeleteUserRequest,
  UpdateAuctionSettingsRequest,
  AuctionSettings,
  Category,
  PaginatedResponse,
  ProductDetails,
  Product,
  AdminUserListItem,
  AdminUser,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import {
  categoryService,
  productService,
  adminService,
  userService,
} from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const stats = await adminService.getDashboardStats();
    return ResponseHandler.sendSuccess<AdminStats>(res, stats);
  }
);

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as GetUsersParams;
    const users = await userService.getAllUsersAdmin(query);
    return ResponseHandler.sendSuccess<PaginatedResponse<AdminUserListItem>>(
      res,
      users
    );
  }
);

export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const user = await userService.getUserByIdAdmin(id);
    return ResponseHandler.sendSuccess<AdminUser>(res, user);
  }
);

export const updateUserInfo = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const body = req.body as UpdateUserInfoRequest;
    const user = await userService.updateUserInfoAdmin(id, body);
    return ResponseHandler.sendSuccess<AdminUser>(res, user);
  }
);

export const updateAccountStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { accountStatus } = req.body as UpdateAccountStatusRequest;
    const user = await userService.updateAccountStatusAdmin(id, accountStatus);
    return ResponseHandler.sendSuccess<AdminUser>(res, user);
  }
);

export const updateUserRole = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { role } = req.body as UpdateUserRoleRequest;
    const user = await userService.updateUserRoleAdmin(id, role);
    return ResponseHandler.sendSuccess<AdminUser>(res, user);
  }
);

export const toggleBanUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { isBanned, reason, duration } = req.body as BanUserRequest;
    const user = await userService.toggleBanUserAdmin(
      id,
      isBanned,
      reason,
      duration
    );
    return ResponseHandler.sendSuccess<AdminUser>(res, user);
  }
);

export const resetUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const body = req.body as ResetUserPasswordRequest;
    await userService.resetUserPasswordAdmin(id, body.newPassword);
    return ResponseHandler.sendSuccess(res, {
      message: "Password reset successfully",
    });
  }
);

export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as CreateUserRequest;
    const user = await userService.createUserAdmin(body);
    return ResponseHandler.sendSuccess<AdminUser>(res, user, 201);
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body as DeleteUserRequest;
    await userService.deleteUserAdmin(id, reason);
    return ResponseHandler.sendSuccess(
      res,
      null,
      200,
      "User deleted successfully"
    );
  }
);

export const getUpgradeRequests = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const params = req.query as unknown as GetUpgradeRequestsParams;
    const result = await adminService.getUpgradeRequests(params);
    return ResponseHandler.sendSuccess(res, result);
  }
);

export const approveUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const adminId = req.user!.id;
    const { adminNote } = req.body as { adminNote?: string };
    await adminService.approveUpgradeRequest(id, adminId, adminNote);
    return ResponseHandler.sendSuccess(res, {
      message: "Upgrade request approved successfully",
    });
  }
);

export const rejectUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const adminId = req.user!.id;
    const { adminNote } = req.body as { adminNote?: string };
    await adminService.rejectUpgradeRequest(id, adminId, adminNote);
    return ResponseHandler.sendSuccess(res, {
      message: "Upgrade request rejected successfully",
    });
  }
);

export const getAllProducts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as AdminGetProductsParams;
    const products = await productService.getProductsAdmin(query);
    return ResponseHandler.sendSuccess<PaginatedResponse<ProductDetails>>(
      res,
      products
    );
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
    const product = await productService.suspendProduct(req.params.id);
    return ResponseHandler.sendSuccess<Product>(res, product, 200);
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

/**
 * Analytics Endpoints
 */

export const getFullAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const analytics = await adminService.getFullAnalytics();
    return ResponseHandler.sendSuccess<AdminAnalytics>(res, analytics);
  }
);

export const updateAuctionSettings = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const data = req.body as UpdateAuctionSettingsRequest;
    const settings = await adminService.updateAuctionSettings(data);
    return ResponseHandler.sendSuccess<AuctionSettings>(res, settings);
  }
);

export const getAuctionSettings = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const settings = await adminService.getAuctionSettings();
    return ResponseHandler.sendSuccess<AuctionSettings>(res, settings);
  }
);
