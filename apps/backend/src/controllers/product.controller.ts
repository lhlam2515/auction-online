import type {
  CreateProductRequest,
  UpdateDescriptionRequest,
  AutoExtendRequest,
  SearchProductsParams,
  TopListingParams,
  TopListingResponse,
  UploadImagesResponse,
  UpdateDescriptionResponse,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { productService } from "@/services";
import { Product } from "@/types/model";
import { NotImplementedError } from "@/utils/errors";
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
    // TODO: Get product details
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
    // TODO: Get product images
    throw new NotImplementedError("Get product images not implemented yet");
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
    const newProduct = await productService.create(
      req.user?.id as string,
      body
    );
    return ResponseHandler.sendSuccess(res, newProduct, 201);
  }
);

export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Delete product (only if not active)
    const productId = req.params.id;
    await productService.delete(productId, req.user?.id as string);
    return ResponseHandler.sendSuccess(res, null, 204);
  }
);

export const updateDescription = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateDescriptionRequest;
    // Update product description (append mode)
    const productId = req.params.id;
    const update: UpdateDescriptionResponse =
      await productService.updateDescription(
        productId,
        req.user?.id as string,
        body.content
      );
    return ResponseHandler.sendSuccess<UpdateDescriptionResponse>(res, update);
  }
);

export const setAutoExtend = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AutoExtendRequest;
    // Set auto-extend setting
    const productId = req.params.id;
    await productService.setAutoExtend(
      productId,
      req.user?.id as string,
      body.isAutoExtend
    );
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
