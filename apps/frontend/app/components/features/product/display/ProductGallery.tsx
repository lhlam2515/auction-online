import type { ProductListing } from "@repo/shared-types";
import Autoplay from "embla-carousel-autoplay";
import { Package, Search } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router";

import { AppEmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
} from "@/components/ui/carousel";
import { APP_ROUTES } from "@/constants/routes";
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
      <AppEmptyState
        icon={<Package />}
        title="Không tìm thấy sản phẩm"
        description="Hiện không có sản phẩm nào phù hợp với danh mục này hoặc điều kiện bạn chọn."
        action={
          <Button asChild variant="default">
            <Link to={APP_ROUTES.SEARCH}>
              <Search className="mr-1 h-4 w-4" />
              Khám phá sản phẩm khác
            </Link>
          </Button>
        }
        className={cn("my-4", className)}
      />
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
      <CarouselPrevious variant="secondary" className="left-0 cursor-pointer" />
      <CarouselNext variant="secondary" className="right-0 cursor-pointer" />
    </Carousel>
  );
};

export default ProductGallery;
