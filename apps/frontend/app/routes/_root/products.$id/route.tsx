import type { ProductDetails, User } from "@repo/shared-types";
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
import { getErrorMessage, showError } from "@/lib/handlers/error";

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
  const [userData, setUserData] = React.useState<User | null>(null);
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
          throw new Error();
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
      if (user && product) {
        setIsSeller(user.id === product.sellerId);
      } else {
        setIsSeller(false);
      }

      const isLoggedIn = !!user;
      let isMounted = true;

      const fetchUserData = async () => {
        if (!isMounted || !isLoggedIn) return;

        try {
          const result = await api.users.getProfile();

          if (!result.success) {
            throw new Error(
              result.error?.message || "Không thể tải dữ liệu người dùng"
            );
          }

          if (isMounted && result.data) {
            setUserData(result.data);
          }
        } catch (error) {
          if (isMounted) {
            const errorMessage = getErrorMessage(
              error,
              "Có lỗi khi tải dữ liệu người dùng"
            );
            showError(error, errorMessage);
          }
        }
      };

      fetchUserData();
      return () => {
        isMounted = false;
      };
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
              isSeller={isSeller}
              userData={userData}
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
              product={product}
              userId={user?.id}
              canKick={isSeller && !isEnded}
              isAuthLoading={isLoading}
            />
          </section>

          <section className="mb-8">
            <ProductQnA
              productId={product.id}
              isLoggedIn={!!user}
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
