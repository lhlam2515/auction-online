import type { ProductListing } from "@repo/shared-types";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

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
  products: ProductListing[];
  loading?: boolean;
  className?: string;
};

const ProductGallery = ({
  products,
  loading = false,
  className,
}: ProductGalleryProps) => {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

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

  if (products.length === 0 && !loading) {
    return (
      <p className="text-muted-foreground py-10 text-center italic">
        Hiện không có sản phẩm phù hợp
      </p>
    );
  }

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
      <CarouselPrevious
        variant="outline"
        className="hover:bg-primary hover:text-primary-foreground left-0"
      />
      <CarouselNext
        variant="outline"
        className="hover:bg-primary hover:text-primary-foreground right-0"
      />
    </Carousel>
  );
};

export default ProductGallery;
