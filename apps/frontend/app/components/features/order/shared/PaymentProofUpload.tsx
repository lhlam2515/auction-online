import { Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PaymentProofUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isUploading?: boolean;
  className?: string;
}

const PaymentProofUpload = ({
  onFileSelect,
  selectedFile,
  isUploading = false,
  className,
}: PaymentProofUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Cleanup function to revoke the URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-semibold">
        Ảnh minh chứng thanh toán <span className="text-destructive">*</span>
      </Label>

      {!selectedFile ? (
        <Card
          className={cn(
            "hover:border-primary/50 cursor-pointer border-2 border-dashed transition-colors",
            {
              "border-primary bg-primary/5": isDragging,
              "border-muted-foreground/25": !isDragging,
            }
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className="text-muted-foreground mb-4 h-12 w-12" />
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Kéo thả ảnh vào đây hoặc chọn file
              </p>
              <p className="text-muted-foreground text-xs">
                Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="group relative">
                <div className="border-border bg-muted/30 flex items-center justify-center overflow-hidden rounded-lg border-2">
                  <img
                    src={previewUrl!}
                    alt="Payment proof preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="absolute top-2 right-2 rounded-full opacity-80 transition-all duration-200 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <AlertSection
        variant="info"
        title="Lưu ý quan trọng:"
        description={
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
            <li>
              Ảnh phải hiển thị rõ thông tin giao dịch (số tiền, mã giao dịch)
            </li>
            <li>Đảm bảo ảnh có độ rõ nét và không bị mờ</li>
            <li>
              Người bán sẽ kiểm tra và xác nhận thanh toán dựa trên ảnh này
            </li>
          </ul>
        }
      />
    </div>
  );
};

export default PaymentProofUpload;
