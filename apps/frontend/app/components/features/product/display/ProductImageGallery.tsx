import type { ProductImage } from "@repo/shared-types";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  productId: string;
  className?: string;
}

const ProductImageGallery = ({
  productId,
  className,
}: ProductImageGalleryProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);

        const result = await api.products.getImages(productId);

        if (!result.success) {
          throw new Error(result.error?.message || "Không thể tải hình ảnh");
        }

        if (isMounted && result.data) {
          setImages(result.data);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(
            error,
            "Có lỗi khi tải hình ảnh"
          );
          showError(error, errorMessage);
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

  // Sync carousel with selected image
  useEffect(() => {
    if (carouselApi) {
      carouselApi.scrollTo(selectedImage, false);
    }
  }, [selectedImage, carouselApi]);

  // Update selected image when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  // Scroll thumbnail container to selected image
  useEffect(() => {
    if (thumbnailContainerRef.current && images.length > 1) {
      const container = thumbnailContainerRef.current;
      const thumbnailWidth = 80 + 12; // w-20 (80px) + gap-3 (12px)
      const containerWidth = container.offsetWidth;
      const scrollPosition =
        selectedImage * thumbnailWidth -
        containerWidth / 2 +
        thumbnailWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, [selectedImage, images.length]);

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
    if (carouselApi) {
      carouselApi.scrollTo(index, true);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border">
          <div className="flex flex-col items-center gap-2">
            <Spinner className="text-primary size-8" />
            <p className="text-muted-foreground text-sm">
              Đang tải hình ảnh...
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-22 w-22 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border">
          <div className="flex flex-col items-center gap-2">
            <ImageOff className="text-muted-foreground h-12 w-12" />
            <p className="text-muted-foreground text-sm">Không có hình ảnh</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Slideshow */}
      <div className="relative">
        <Carousel
          setApi={setCarouselApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          onMouseEnter={() => autoplayPlugin.current.stop()}
          onMouseLeave={() => autoplayPlugin.current.play()}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border shadow-sm">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `Hình ảnh sản phẩm ${index + 1}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                  {/* Image counter */}
                  <Badge variant="secondary" className="absolute top-4 right-4">
                    {index + 1} / {images.length}
                  </Badge>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => carouselApi?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Ảnh trước</span>
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => carouselApi?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Ảnh sau</span>
              </Button>
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="relative">
          <div
            ref={thumbnailContainerRef}
            className={cn(
              "flex gap-3 overflow-x-auto p-2",
              "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full"
            )}
          >
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative aspect-square h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105",
                  selectedImage === index
                    ? "border-primary ring-primary shadow-lg ring-1"
                    : "border-secondary hover:border-muted-foreground shadow-sm"
                )}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover transition-opacity duration-200"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="mt-3 flex justify-center gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  selectedImage === index
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/50 hover:bg-muted-foreground cursor-pointer"
                )}
                aria-label={`Chuyển đến ảnh ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
