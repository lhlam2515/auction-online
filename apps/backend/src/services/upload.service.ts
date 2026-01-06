import { randomUUID } from "crypto";
import path from "path";

import type { UploadImagesResponse } from "@repo/shared-types";

import logger from "@/config/logger";
import { supabase } from "@/config/supabase";
import { BadRequestError } from "@/utils/errors";

export class UploadService {
  async uploadImages(
    files: Express.Multer.File[],
    pathPrefix: string
  ): Promise<UploadImagesResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestError("No files provided");
    }

    if (files.length > 10) {
      throw new BadRequestError("Maximum 10 images allowed");
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestError(
          `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`
        );
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestError(
          `File too large: ${file.originalname}. Maximum size is 5MB.`
        );
      }
    }

    // Only allow alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(pathPrefix)) {
      throw new BadRequestError("Invalid path prefix");
    }

    // Track uploaded file paths for rollback
    const uploadedPaths: string[] = [];

    try {
      // Upload files sequentially to track progress for rollback
      const urls: string[] = [];

      for (const file of files) {
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileName = `${randomUUID()}${fileExt}`;
        const filePath = `${pathPrefix}/${fileName}`;

        const { error } = await supabase.storage
          .from("images")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          logger.error(`Failed to upload file ${file.originalname}`, error);
          throw error;
        }

        // Track uploaded file for potential rollback
        uploadedPaths.push(filePath);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);
      }

      return { urls };
    } catch (error) {
      // Rollback: Delete all successfully uploaded files
      if (uploadedPaths.length > 0) {
        logger.warn(
          `Rolling back ${uploadedPaths.length} uploaded files due to error`
        );

        const { error: deleteError } = await supabase.storage
          .from("images")
          .remove(uploadedPaths);

        if (deleteError) {
          // Log deletion failure but don't throw - original error is more important
          logger.error(
            `Failed to rollback uploaded files: ${deleteError.message}`,
            deleteError
          );
        }
      }

      throw new BadRequestError(
        `Failed to upload images: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export const uploadService = new UploadService();
