import type { ProductDetails } from "@repo/shared-types";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { ProductDescription } from "@/components/features/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import type { Route } from "./+types/route";
import { AppendDescForm } from "./AppendDescForm";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản Lý Đấu Giá - Online Auction" },
    {
      name: "description",
      content: "Trang quản lý đấu giá cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function ManageAuctionPage({ params }: Route.ComponentProps) {
  const { id: productId } = params;
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.products.getById(productId);
        if (!isMounted) return;

        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          toast.error("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Có lỗi khi tải thông tin sản phẩm");
        }
        logger.error("Error fetching product:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleDescriptionSuccess = () => {
    // Force ProductDescription to re-render by changing key
    setDescriptionKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</p>
          <p className="text-muted-foreground">
            Sản phẩm không tồn tại hoặc đã bị xóa
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Edit className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Cập nhật mô tả</CardTitle>
            <CardDescription className="text-lg">
              <Link
                to={APP_ROUTES.PRODUCT(productId)}
                target="_blank"
                className="hover:underline"
              >
                {product.name}
              </Link>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Product Description Display */}
        <ProductDescription
          key={descriptionKey}
          productId={productId}
          initialDescription={product.description}
        />

        {/* Add Description Form */}
        <AppendDescForm
          productId={productId}
          onSuccess={handleDescriptionSuccess}
        />
      </CardContent>
    </Card>
  );
}
