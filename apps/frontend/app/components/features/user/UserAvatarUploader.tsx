import type { User } from "@repo/shared-types";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";

/**
 * Props for the UserAvatarUploader component
 */
interface UserAvatarUploaderProps {
  /** User data object containing profile information including avatar URL */
  userData?: User;
  /** Callback function called when new file is selected */
  onFileSelect?: (file: File) => void;
}

/**
 * Component for displaying and changing user avatar
 *
 * Features:
 * - Displays current user avatar with fallback to initials
 * - Allows selecting new avatar image with preview
 * - Validates file type (images only) and size (max 5MB)
 * - Passes selected file to parent component
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function UserAvatarUploader({
  userData,
  onFileSelect,
}: UserAvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Triggers the hidden file input click to open file selection dialog
   */
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection and preview
   *
   * Validates the selected file and updates preview.
   * Calls onFileSelect callback with valid file.
   *
   * @param event - File input change event
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      showError(null, "Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showError(null, "File ảnh không được vượt quá 5MB");
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Notify parent
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Reset preview when userData changes (e.g., after successful upload)
  useEffect(() => {
    if (userData?.avatarUrl) {
      setPreviewUrl(null);
    }
  }, [userData?.avatarUrl]);

  const currentAvatarUrl = previewUrl || userData?.avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Section title */}
      <div className="text-center">
        <h3 className="text-card-foreground text-xl font-semibold">
          Ảnh Đại Diện
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Cập nhật ảnh đại diện của bạn
        </p>
      </div>

      {/* Avatar display with fallback to user initials */}
      <Avatar className="h-36 w-36">
        {currentAvatarUrl ? (
          <AvatarImage
            src={currentAvatarUrl}
            alt={userData?.fullName || "User Avatar"}
            className="object-cover"
            width={144}
            height={144}
          />
        ) : (
          <AvatarFallback>
            {userData?.fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Button to trigger file selection */}
      <Button
        className="bg-slate-900 text-white hover:bg-slate-500"
        variant="outline"
        size="sm"
        onClick={handleFileSelect}
      >
        <Camera className="mr-2 h-4 w-4" />
        Thay Đổi Ảnh
      </Button>

      {/* Hidden file input for image selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
