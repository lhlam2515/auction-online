import type { ProductListing } from "@repo/shared-types";
import { ShoppingCart } from "lucide-react";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";

import ProductGallery from "./ProductGallery";

type ProductRelatedListProps = {
  productId: string;
  className?: string;
};

const ProductRelatedList = ({
  productId,
  className,
}: ProductRelatedListProps) => {
  const [products, setProducts] = React.useState<ProductListing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchRelatedProducts = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);

        const result = await api.products.getRelated(productId);

        if (!result.success) {
          throw new Error(
            result.error?.message || "Không thể tải sản phẩm liên quan"
          );
        }

        if (isMounted && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(
            error,
            "Có lỗi khi tải sản phẩm liên quan"
          );
          showError(error, errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRelatedProducts();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          Sản phẩm cùng loại
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading || products.length !== 0 ? (
          <ProductGallery
            products={products}
            loading={loading}
          ></ProductGallery>
        ) : (
          <p className="text-muted-foreground text-center">
            Không có sản phẩm liên quan
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductRelatedList;
