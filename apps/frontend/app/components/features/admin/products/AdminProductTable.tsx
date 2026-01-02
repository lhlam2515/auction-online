import type { ProductDetails } from "@repo/shared-types";
import { Package } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { ProductStatusBadge } from "@/components/common/badges";
import SuspendProductDialog from "@/components/features/admin/products/SuspendProductDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_ROUTES } from "@/constants/routes";
import { cn, formatPrice } from "@/lib/utils";

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
  if (!products || products.length === 0) {
    const emptyMessage = loading
      ? "Đang tải dữ liệu..."
      : "Không có sản phẩm nào";

    return (
      <div
        className={cn(
          "bg-muted/60 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed",
          className
        )}
      >
        <div className="text-center">
          <Package className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
          <p className="text-muted-foreground mt-2">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Người bán</TableHead>
            <TableHead>Giá hiện tại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            return (
              <TableRow key={product.id}>
                <TableCell className="wrap-break-word whitespace-normal">
                  <div className="flex items-center gap-3">
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Link
                        to={APP_ROUTES.PRODUCT(product.id)}
                        className="font-medium wrap-break-word hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="wrap-break-word whitespace-normal">
                  <span className="text-sm">{product.categoryName}</span>
                </TableCell>
                <TableCell className="wrap-break-word whitespace-normal">
                  <span className="text-sm">{product.sellerName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {formatPrice(
                      Number(product.currentPrice || product.startPrice)
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell>
                  {product.status === "ACTIVE" && (
                    <SuspendProductDialog
                      product={product}
                      onSuspend={() => onSuspendProduct(product.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminProductTable;
