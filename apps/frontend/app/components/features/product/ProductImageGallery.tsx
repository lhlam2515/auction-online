import type { ProductImage } from "@repo/shared-types";
import React from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  productId: string;
  className?: string;
  [key: string]: any;
}

export function ProductImageGallery({
  productId,
  className,
}: ProductImageGalleryProps) {
  const [images, setImages] = React.useState<ProductImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await api.products.getImages(productId);

        if (isMounted) {
          if (response.success && response.data) {
            setImages(response.data);
          } else {
            logger.error("Failed to load product images");
            toast.error("Không thể tải hình ảnh");
          }
        }
      } catch (err) {
        if (isMounted) {
          logger.error("Error fetching product images:", err);
          toast.error("Có lỗi khi tải hình ảnh");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault(); // Ngăn chặn hành vi kéo ảnh ra ngoài
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startX;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          <p className="text-muted-foreground">Đang tải hình ảnh...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          <p className="text-muted-foreground">Không có hình ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="bg-muted relative aspect-square overflow-hidden rounded-lg border">
        <img
          src={images[selectedImage]?.imageUrl}
          alt={images[selectedImage]?.altText || ""}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`scrollbar-thin flex gap-2 overflow-x-auto p-2 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                selectedImage === index
                  ? "border-slate-900 ring-2 ring-slate-900 dark:border-slate-100 dark:ring-slate-100"
                  : "border-gray-200 hover:border-slate-400"
              } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || ""}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
