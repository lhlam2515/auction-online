import type { User, ProductDetails } from "@repo/shared-types";
import React from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

import { ProductQA } from "@/components/features/interaction/ProductQnA";
import { ProductDescription } from "@/components/features/product/ProductDescription";
import { ProductImageGallery } from "@/components/features/product/ProductImageGallery";
import { ProductMainInfo } from "@/components/features/product/ProductInfo";
import RelatedProducts from "@/components/features/product/RelatedProducts";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { HistoryTable } from "@/routes/_root/products.$id/HistoryTable";

import type { Route } from "./+types/route";
import { BiddingDialog } from "./BidForm";

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
  const [userData, setUserData] = React.useState<User>();

  const [showBiddingDialog, setShowBiddingDialog] = React.useState(false);
  const [isEnded, setIsEnded] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);

        // Fetch product first
        if (!id) {
          if (isMounted) {
            navigate("/not-found", { replace: true });
          }
          return;
        }
        const product_res = await api.products.getById(id);

        // If product fetch fails, redirect to not found
        if (!product_res.success || !product_res.data) {
          if (isMounted) {
            navigate("/not-found", { replace: true });
          }
          return;
        }

        // Set product data
        if (isMounted) {
          setProduct(product_res.data);
          setIsEnded(new Date() > new Date(product_res.data.endTime));
        }
      } catch (error) {
        toast.error("Không thể tải sản phẩm.");
        logger.error("Failed to load product:", error);
        if (isMounted) {
          navigate("/not-found", { replace: true });
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

  React.useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (user) {
          const user_res = await api.users.getProfile();
          if (isMounted) {
            if (user_res.success && user_res.data) {
              setUserData(user_res.data);
            }
          }
        }
      } catch (error) {
        logger.error("Failed to fetch user data:", error);
        toast.error("Không thể tải dữ liệu người dùng.");
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [user, isLoading]);

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

  const handleBidClick = () => {
    if (isLoggedIn) {
      setShowBiddingDialog(true);
    } else {
      toast.error("Vui lòng đăng nhập để đặt giá.");
    }
  };

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

            <ProductMainInfo
              className="lg:col-span-3"
              product={product}
              isLoggedIn={isLoggedIn}
              isSeller={isSeller}
              onBidClick={handleBidClick}
            />
          </section>

          <section className="mb-8">
            <ProductDescription
              productId={product.id}
              initialDescription={product.description}
            />
          </section>

          <section className="mb-8">
            <HistoryTable
              productId={product.id}
              isSeller={isSeller}
              isEnded={isEnded}
            />
          </section>

          <section className="mb-8">
            <ProductQA
              productId={product.id}
              isLoggedIn={isLoggedIn}
              isSeller={isSeller}
              isEnded={isEnded}
            />
          </section>

          <section className="mb-8">
            <RelatedProducts productId={product.id} />
          </section>

          <BiddingDialog
            open={showBiddingDialog}
            onOpenChange={setShowBiddingDialog}
            product={product}
            userRating={userData?.ratingScore ? userData?.ratingScore * 100 : 0}
          />
        </div>
      )}
    </>
  );
}
