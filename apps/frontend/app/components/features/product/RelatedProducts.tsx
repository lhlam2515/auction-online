import { ShoppingCart } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-layer";

import ProductGallery from "./ProductGallery";
import ProductGrid from "./ProductGrid";

type RelatedProductsProps = {
  productId: string;
  className?: string;
  [key: string]: any;
};

/**
 * Component: RelatedProducts
 * Generated automatically based on Project Auction SRS.
 */
const RelatedProducts = ({ productId, className }: RelatedProductsProps) => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchRelatedProducts = async () => {
      if (!isMounted) return;
      try {
        setLoading(true);
        const response = await api.products.getRelated(productId);

        if (isMounted) {
          if (response.success && response.data) {
            setProducts(response.data);
          } else {
            toast.error("Không thể tải sản phẩm liên quan");
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Có lỗi khi tải sản phẩm liên quan");
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

export default RelatedProducts;
