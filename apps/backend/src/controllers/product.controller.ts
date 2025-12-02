import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";
import type {
  Product,
  CreateProductRequest,
  UpdateDescriptionRequest,
  AutoExtendRequest,
  SearchProductsParams,
  TopListingParams,
  TopListingResponse,
  UploadImagesResponse,
  DescriptionUpdate,
} from "@repo/shared-types";

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
    // ResponseHandler.sendSuccess<Product>(res, product);
    throw new NotImplementedError("Get product details not implemented yet");
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
    // TODO: Get product description update history
    throw new NotImplementedError(
      "Get description updates not implemented yet"
    );
  }
);

export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateProductRequest;
    // TODO: Create new product listing
    throw new NotImplementedError("Create product not implemented yet");
  }
);

export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Delete product (only if not active)
    throw new NotImplementedError("Delete product not implemented yet");
  }
);

export const updateDescription = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateDescriptionRequest;
    // TODO: Update product description (append mode)
    throw new NotImplementedError("Update description not implemented yet");
  }
);

export const toggleAutoExtend = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AutoExtendRequest;
    // TODO: Toggle auto-extend setting
    throw new NotImplementedError("Toggle auto-extend not implemented yet");
  }
);

export const uploadImages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Upload product images
    // ResponseHandler.sendSuccess<UploadImagesResponse>(res, { urls });
    throw new NotImplementedError("Upload images not implemented yet");
  }
);
