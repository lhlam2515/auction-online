import { randomUUID } from "crypto";
import path from "path";

import { UploadImagesResponse } from "@repo/shared-types";

import { supabase, supabaseAdmin } from "@/config/supabase";
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

    const uploadPromises = files.map(async (file, index) => {
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

      // Nếu dùng customName (Avatar), thực hiện xóa file cũ trước (nếu có)
      // Theo yêu cầu: Xóa tất cả ảnh cũ (kể cả cùng extension) để đảm bảo không bị cache hoặc lỗi không update nội dung
      if (customName) {
        const extensions = [".jpg", ".jpeg", ".png", ".webp"];
        // Xóa hết các file có tên customName với mọi extension
        const filesRemove = extensions.map(
          (ext) => `${pathPrefix}/${customName}${ext}`
        );

        if (filesRemove.length > 0) {
          await supabaseAdmin.storage.from("images").remove(filesRemove);
        }
      }

      // Use supabaseAdmin to bypass RLS policies
      // If customName is used (like avatar), set cacheControl to '0' (no-cache) to ensure updates are seen immediately.
      const cacheControl = customName ? "0" : "3600";

      const { data, error } = await supabaseAdmin.storage
        .from("images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: cacheControl,
          upsert: true,
        });

      if (error) {
        throw new BadRequestError(
          `Failed to upload ${file.originalname}: ${error.message}`
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("images")
        .getPublicUrl(filePath);

      // Append timestamp to prevent browser caching only for custom named files (which are likely overwritten)
      if (customName) {
        return `${urlData.publicUrl}?v=${Date.now()}`;
      }

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
