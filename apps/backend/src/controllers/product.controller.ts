import type {
  CreateProductRequest,
  UpdateDescriptionRequest,
  AutoExtendRequest,
  SearchProductsParams,
  TopListingParams,
  TopListingResponse,
  UploadImagesResponse,
  UpdateDescriptionResponse,
  ProductImage,
  Product,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { productService } from "@/services";
import { BadRequestError, NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const searchProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as SearchProductsParams;
    // TODO: Search and filter products
    throw new NotImplementedError("Search products not implemented yet");
  }
);

export const getTopListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as TopListingParams;
    // TODO: Get top products (ending soon, hot, new)
    // ResponseHandler.sendSuccess<TopListingResponse>(res, topListings);
    throw new NotImplementedError("Get top listing not implemented yet");
  }
);

export const getProductDetails = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get product details
    const productId = req.params.id;
    const product = await productService.getById(productId);
    return ResponseHandler.sendSuccess<Product>(res, product);
  }
);

export const getRelatedProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get related products
    throw new NotImplementedError("Get related products not implemented yet");
  }
);

export const getProductImages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get product images
    const productId = req.params.id;
    const images = await productService.getProductImages(productId);
    return ResponseHandler.sendSuccess<ProductImage[]>(res, images);
  }
);

export const getDescriptionUpdates = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get product description update history
    const productId = req.params.id;
    const updates = await productService.getDescriptionUpdates(productId);
    return ResponseHandler.sendSuccess<UpdateDescriptionResponse[]>(
      res,
      updates
    );
  }
);

export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateProductRequest;
    // Create new product listing
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new BadRequestError("Seller ID is required");
    }
    const newProduct = await productService.create(sellerId, body);
    return ResponseHandler.sendSuccess<Product>(res, newProduct, 201);
  }
);

export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Delete product (only if not active)
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new BadRequestError("Seller ID is required");
    }
    const productId = req.params.id;
    await productService.delete(productId, sellerId);
    return ResponseHandler.sendSuccess(res, null, 204);
  }
);

export const updateDescription = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateDescriptionRequest;
    // Update product description (append mode)
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new BadRequestError("Seller ID is required");
    }
    const productId = req.params.id;
    const update: UpdateDescriptionResponse =
      await productService.updateDescription(productId, sellerId, body.content);
    return ResponseHandler.sendSuccess<UpdateDescriptionResponse>(res, update);
  }
);

export const setAutoExtend = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AutoExtendRequest;
    // Set auto-extend setting
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new BadRequestError("Seller ID is required");
    }
    const productId = req.params.id;
    await productService.setAutoExtend(productId, sellerId, body.isAutoExtend);
    return ResponseHandler.sendSuccess(res, null, 204);
  }
);

export const uploadImages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Upload product images
    // ResponseHandler.sendSuccess<UploadImagesResponse>(res, { urls });
    throw new NotImplementedError("Upload images not implemented yet");
  }
);
