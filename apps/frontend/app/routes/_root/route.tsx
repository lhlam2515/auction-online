import type { TopListingResponse } from "@repo/shared-types";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import ProductGallery from "@/components/features/product/ProductGallery";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home Page - Online Auction" },
    { name: "description", content: "Home Page page for Online Auction App" },
  ];
}

export default function HomePage() {
  const [topListing, setTopListing] = useState<TopListingResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTopListing() {
      try {
        setLoading(true);
        setError("");
        const response = await api.products.getTopListing();
        if (response.success) {
          setTopListing(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        logger.error("Failed to fetch top listing", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopListing();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <section className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Chào mừng đến với Online Auction
          </h1>
          <p className="mb-6 text-lg text-slate-300 md:text-xl">
            Khám phá những sản phẩm hot nhất đang được săn đón
          </p>
          <Button
            size="lg"
            className="bg-blue-600 px-8 text-white hover:bg-blue-700"
          >
            <Link to="/search">Xem tất cả</Link>
          </Button>
        </div>
      </section>

      {error && <p className="my-8 text-center text-red-600">{error}</p>}
      {(loading || topListing) && (
        <section>
          <div className="py-12">
            <h2 className="mb-1 text-center text-2xl font-bold text-slate-900 md:text-3xl">
              Sắp Kết Thúc
            </h2>
            <p className="text-muted-foreground text-center">
              Những sản phẩm sắp kết thúc phiên đấu giá
            </p>
            <ProductGallery
              className="mx-auto mt-5"
              products={topListing?.endingSoon || []}
              loading={loading}
            />
          </div>
          <div className="bg-white py-12">
            <h2 className="mb-1 text-center text-2xl font-bold text-slate-900 md:text-3xl">
              Đấu Giá Sôi Động
            </h2>
            <p className="text-muted-foreground text-center">
              Sản phẩm có nhiều lượt đấu giá nhất
            </p>
            <ProductGallery
              className="mx-auto mt-5"
              products={topListing?.hot || []}
              loading={loading}
            />
          </div>
          <div className="py-12">
            <h2 className="mb-1 text-center text-2xl font-bold text-slate-900 md:text-3xl">
              Giá Cao Nhất
            </h2>
            <p className="text-muted-foreground text-center">
              Những sản phẩm đấu giá giá trị lớn nhất
            </p>
            <ProductGallery
              className="mx-auto mt-5"
              products={topListing?.highestPrice || []}
              loading={loading}
            />
          </div>
        </section>
      )}
    </div>
  );
}
