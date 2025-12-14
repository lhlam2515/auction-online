import type { ProductListing } from "@repo/shared-types";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
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
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  // Hiển thị 5 skeleton cards khi đang loading
  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 3 }, (_, index) => (
        <CarouselItem key={`skeleton-${index}`} className="lg:basis-1/3">
          <div>
            <ProductCardSkeleton className="mx-auto" />
          </div>
        </CarouselItem>
      ));
    }

    return products.map((product) => (
      <CarouselItem key={product.id} className="lg:basis-1/3">
        <div>
          <ProductCard product={product} className="mx-auto" />
        </div>
      </CarouselItem>
    ));
  };

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={() => plugin.current.play()}
      className={cn("max-w-7xl", className)}
    >
      <CarouselContent>{renderContent()}</CarouselContent>
      <CarouselPrevious variant="ghost" className="left-0" />
      <CarouselNext variant="ghost" className="right-0" />
    </Carousel>
  );
};

export default ProductGallery;
