import type { ProductDetails } from "@repo/shared-types";
import React from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

import { BidHistoryTable } from "@/components/features/bidding";
import ProductQnA from "@/components/features/interaction/ProductQnA";
import {
  ProductImageGallery,
  ProductInfo,
  ProductDescription,
  ProductRelatedList,
} from "@/components/features/product/display";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Detail - Online Auction" },
    {
      name: "description",
      content: "Product Detail page for Online Auction App",
    },
  ];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [product, setProduct] = React.useState<ProductDetails>();
  const [isSeller, setIsSeller] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const [isEnded, setIsEnded] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);

        // Fetch product first
        if (!id) {
          if (isMounted) {
            toast.error("Thiếu ID sản phẩm");
            navigate(APP_ROUTES.NOT_FOUND, { replace: true });
          }
          return;
        }

        const product_res = await api.products.getById(id);

        // If product fetch fails, redirect to not found
        if (!product_res.success || !product_res.data) {
          if (isMounted) {
            throw new Error();
          }
          return;
        }

        // Set product data
        if (isMounted) {
          setProduct(product_res.data);
          setIsEnded(
            product_res.data.status !== "ACTIVE" ||
              new Date() > new Date(product_res.data.endTime)
          );
        }
      } catch {
        if (isMounted) {
          toast.error("Không tìm thấy sản phẩm", {
            description: "Sản phẩm có thể đã bị gỡ hoặc không tồn tại.",
          });
          navigate(APP_ROUTES.NOT_FOUND, { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Handle user authentication state
  React.useEffect(() => {
    if (!isLoading) {
      setIsLoggedIn(!!user);
      if (user && product) {
        setIsSeller(user.id === product.sellerId);
      } else {
        setIsSeller(false);
      }
    }
  }, [isLoading, user, product]);

  return (
    <>
      {!loading && product && (
        <div className="container mx-auto px-4 py-6">
          {/* Top Section */}
          <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
            <ProductImageGallery
              productId={product.id}
              className="lg:col-span-2"
            />

            <ProductInfo
              className="lg:col-span-3"
              product={product}
              isLoggedIn={isLoggedIn}
              isSeller={isSeller}
              userId={user?.id}
            />
          </section>

          <section className="mb-8">
            <ProductDescription
              productId={product.id}
              initialDescription={product.description}
            />
          </section>

          <section className="mb-8">
            <BidHistoryTable
              productId={product.id}
              isSeller={isSeller}
              isEnded={isEnded}
            />
          </section>

          <section className="mb-8">
            <ProductQnA
              productId={product.id}
              isLoggedIn={isLoggedIn}
              isSeller={isSeller}
              isEnded={isEnded}
            />
          </section>

          <section className="mb-8">
            <ProductRelatedList productId={product.id} />
          </section>
        </div>
      )}
    </>
  );
}
