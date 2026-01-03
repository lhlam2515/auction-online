import type { ProductDetails } from "@repo/shared-types";
import { Package } from "lucide-react";
import React from "react";

import { ProductStatusBadge } from "@/components/common/badges";
import {
  ProductCell,
  ProductTable,
  type ProductTableAction,
  type ProductTableColumn,
} from "@/components/features/product/display";
import { formatPrice } from "@/lib/utils";

import SuspendProductDialog from "./SuspendProductDialog";

type AdminProductTableProps = {
  products: ProductDetails[];
  loading?: boolean;
  onSuspendProduct: (productId: string) => Promise<void>;
  className?: string;
};

const AdminProductTable = ({
  products,
  loading = false,
  onSuspendProduct,
  className,
}: AdminProductTableProps) => {
  const columns: ProductTableColumn<ProductDetails>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      render: (product) => (
        <ProductCell
          productId={product.id}
          name={product.name}
          imageUrl={product.mainImageUrl}
        />
      ),
      className: "wrap-break-word whitespace-normal",
    },
    {
      key: "category",
      header: "Danh mục",
      render: (product) => (
        <span className="text-sm">{product.categoryName}</span>
      ),
      className: "wrap-break-word whitespace-normal",
    },
    {
      key: "seller",
      header: "Người bán",
      render: (product) => (
        <span className="text-sm">{product.sellerName}</span>
      ),
      className: "wrap-break-word whitespace-normal",
    },
    {
      key: "price",
      header: "Giá hiện tại",
      render: (product) => (
        <span className="text-sm font-medium">
          {formatPrice(Number(product.currentPrice || product.startPrice))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (product) => <ProductStatusBadge status={product.status} />,
    },
  ];

  const actions: ProductTableAction<ProductDetails>[] = [
    {
      key: "suspend",
      render: (product) => (
        <SuspendProductDialog
          product={product}
          onSuspend={() => onSuspendProduct(product.id)}
        />
      ),
      hidden: (product) => product.status !== "ACTIVE",
    },
  ];

  const emptyMessage = loading
    ? "Đang tải dữ liệu..."
    : "Không có sản phẩm nào";

  return (
    <ProductTable<ProductDetails>
      products={products}
      columns={columns}
      actions={actions}
      emptyMessage={emptyMessage}
      emptyIcon={
        <Package className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
      }
      className={className}
    />
  );
};

export default AdminProductTable;
