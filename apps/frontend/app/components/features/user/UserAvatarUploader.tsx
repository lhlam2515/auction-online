import type { User } from "@repo/shared-types";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/lib/handlers/error";

/**
 * Props for the UserAvatarUploader component
 */
interface UserAvatarUploaderProps {
  /** User data object containing profile information including avatar URL */
  userData?: User;
  /** Callback function called when new file is selected */
  onFileSelect?: (file: File) => void;
  /** Loading state to indicate if profile data is being fetched */
  isLoading?: boolean;
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
  isLoading = false,
}: UserAvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    userData?.avatarUrl || null
  );
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
      {isLoading ? (
        <Skeleton className="bg-muted h-36 w-36 rounded-full" />
      ) : (
        <UserAvatar
          name={userData?.fullName || "User"}
          imageUrl={currentAvatarUrl}
          className="h-36 w-36"
          fallbackClassName="text-4xl"
        />
      )}

      {/* Button to trigger file selection */}
      <Button
        className="bg-primary text-primary-foreground hover:opacity-90"
        variant="default"
        size="sm"
        onClick={handleFileSelect}
      >
        <Camera className="mr-1 h-4 w-4" />
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
