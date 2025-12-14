import type { ProductListing } from "@repo/shared-types";
import React from "react";

import { cn } from "@/lib/utils";

import ProductCard, { ProductCardSkeleton } from "./ProductCard";

type ProductGridProps = {
  products: ProductListing[];
  loading?: boolean;
  className?: string;
  [key: string]: any;
};

/**
 * Component: ProductGrid
 * Generated automatically based on Project Auction SRS.
 */
const ProductGrid = ({ products, loading, className }: ProductGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 place-items-center gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {loading
        ? // Hiển thị 6 skeleton cards khi đang loading
          Array.from({ length: 6 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        : products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
    </div>
  );
};

export default ProductGrid;
