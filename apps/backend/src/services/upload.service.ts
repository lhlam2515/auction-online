import { randomUUID } from "crypto";
import path from "path";

import type { UploadImagesResponse } from "@repo/shared-types";
import { index } from "drizzle-orm/gel-core";

import logger from "@/config/logger";
import { supabaseAdmin } from "@/config/supabase";
import { BadRequestError } from "@/utils/errors";

export class UploadService {
  async uploadImages(
    files: Express.Multer.File[],
    pathPrefix: string,
    customName?: string
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

        let fileName;
        if (customName) {
          // If customName is provided, use it.
          // If multiple files, append index to ensure uniqueness,
          // unless it's a single file then keep it clean.
          fileName =
            files.length > 1
              ? `${customName}-${index}${fileExt}`
              : `${customName}${fileExt}`;
        } else {
          fileName = `${randomUUID()}${fileExt}`;
        }

        const filePath = `${pathPrefix}/${fileName}`;

        // If using customName, remove existing files with that name (all extensions)
        if (customName) {
          const extensions = [".jpg", ".jpeg", ".png", ".webp"];
          const filesRemove = extensions.map(
            (ext) => `${pathPrefix}/${customName}${ext}`
          );
          if (filesRemove.length > 0) {
            await supabaseAdmin.storage.from("images").remove(filesRemove);
          }
        }

        // Use supabaseAdmin to bypass RLS policies
        const cacheControl = customName ? "0" : "3600"; // No cache for custom names
        const { error } = await supabaseAdmin.storage
          .from("images")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: cacheControl,
            upsert: true,
          });

        if (error) {
          logger.error(`Failed to upload file ${file.originalname}`, error);
          throw error;
        }

        // Track uploaded file for potential rollback
        uploadedPaths.push(filePath);

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from("images")
          .getPublicUrl(filePath);

        // Append timestamp to URL to prevent caching if customName is used
        if (customName) {
          urls.push(`${urlData.publicUrl}?v=${Date.now()}`);
        } else {
          urls.push(urlData.publicUrl);
        }
      }

      return { urls };
    } catch (error) {
      // Rollback: Delete all successfully uploaded files
      if (uploadedPaths.length > 0) {
        logger.warn(
          `Rolling back ${uploadedPaths.length} uploaded files due to error`
        );

        const { error: deleteError } = await supabaseAdmin.storage
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
