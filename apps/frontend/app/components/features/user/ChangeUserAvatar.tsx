import type { User } from "@repo/shared-types";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";

/**
 * Props for the ChangeUserAvatar component
 */
interface ChangeUserAvatarProps {
  /** User data object containing profile information including avatar URL */
  userData?: User;
  /** Callback function called when avatar is successfully updated with new URL */
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

/**
 * Component for displaying and changing user avatar
 *
 * Features:
 * - Displays current user avatar with fallback to initials
 * - Allows selecting and uploading new avatar image
 * - Validates file type (images only) and size (max 5MB)
 * - Shows upload progress and handles errors
 * - Calls onAvatarUpdate callback when upload succeeds
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function ChangeUserAvatar({
  userData,
  onAvatarUpdate,
}: ChangeUserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Triggers the hidden file input click to open file selection dialog
   */
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection and upload process
   *
   * Validates the selected file, uploads it to the server,
   * and updates the avatar URL if successful.
   *
   * @param event - File input change event
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    setIsUploading(true);

    try {
      // TODO: Implement avatar upload logic
      // You need to create an API endpoint for uploading avatar images
      // For example: const result = await api.users.uploadAvatar(formData);
      // Then update the profile with the new avatar URL

      // Placeholder: Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Placeholder: Assume upload successful and get new URL
      const newAvatarUrl = "https://example.com/avatar.jpg"; // Replace with actual URL

      logger.info("Avatar upload simulated successfully");

      // Update the avatar URL
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showError(error, errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
        {userData && userData.avatarUrl ? (
          <AvatarImage
            src={userData.avatarUrl}
            alt={userData.fullName}
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
        disabled={isUploading}
      >
        <Camera className="mr-2 h-4 w-4" />
        {isUploading ? "Đang tải lên..." : "Thay Đổi Ảnh"}
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
