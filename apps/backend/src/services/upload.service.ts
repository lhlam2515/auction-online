import { randomUUID } from "crypto";
import path from "path";

import { UploadImagesResponse } from "@repo/shared-types";

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

    if (pathPrefix.includes("..") || pathPrefix.includes("//")) {
      throw new BadRequestError("Invalid path prefix");
    }
    if (pathPrefix.trim().length === 0) {
      throw new BadRequestError("Path prefix cannot be empty");
    }

    const uploadPromises = files.map(async (file) => {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${randomUUID()}${fileExt}`;
      const filePath = `${pathPrefix}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new BadRequestError(
          `Failed to upload ${file.originalname}: ${error.message}`
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      return { urls };
    } catch (error) {
      throw new BadRequestError(
        `Failed to upload images: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export const uploadService = new UploadService();
