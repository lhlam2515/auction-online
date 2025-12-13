import type { ProductListing } from "@repo/shared-types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import ProductCard, { ProductCardSkeleton } from "./ProductCard";

type ProductGalleryProps = {
  className?: string;
  products: ProductListing[];
  loading?: boolean;
};

/**
 * Component: ProductGallery
 * Generated automatically based on Project Auction SRS.
 */
const ProductGallery = ({
  className,
  products,
  loading = false,
}: ProductGalleryProps) => {
  // Hiển thị 5 skeleton cards khi đang loading
  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 5 }, (_, index) => (
        <CarouselItem
          key={`skeleton-${index}`}
          className="sm:basis-1/2 lg:basis-1/3"
        >
          <div className="p-1">
            <ProductCardSkeleton />
          </div>
        </CarouselItem>
      ));
    }

    return products.map((product) => (
      <CarouselItem key={product.id} className="sm:basis-1/2 lg:basis-1/3">
        <div className="p-1">
          <ProductCard product={product} />
        </div>
      </CarouselItem>
    ));
  };

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className={cn("w-3/4 max-w-7xl", className)}
    >
      <CarouselContent>{renderContent()}</CarouselContent>
      <CarouselPrevious variant="default" />
      <CarouselNext variant="default" />
    </Carousel>
  );
};

export default ProductGallery;
