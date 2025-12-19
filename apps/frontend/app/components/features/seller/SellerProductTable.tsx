import type { ProductListing } from "@repo/shared-types";
import { Package, Edit, MoreVertical, Gavel, Clock } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { cn, formatPrice, formatTimeRemaining } from "@/lib/utils";

type SellerProductTableProps = {
  products: ProductListing[];
  type: "active" | "ended";
  className?: string;
};

const SellerProductTable = ({
  products,
  type,
  className,
}: SellerProductTableProps) => {
  if (!products || products.length === 0) {
    const emptyMessage =
      type === "active"
        ? "Danh sách sản phẩm đang đấu giá sẽ hiển thị ở đây"
        : "Danh sách sản phẩm đã kết thúc phiên đấu giá sẽ hiển thị ở đây";

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
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        variant: "secondary" as const,
        label: "Đang đấu giá",
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      },
      SOLD: {
        variant: "secondary" as const,
        label: "Đã bán",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      NO_SALE: {
        variant: "secondary" as const,
        label: "Không bán được",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
      CANCELLED: {
        variant: "secondary" as const,
        label: "Đã hủy",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      SUSPENDED: {
        variant: "secondary" as const,
        label: "Tạm ngừng",
        className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      },
      PENDING: {
        variant: "secondary" as const,
        label: "Chờ duyệt",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>
              {type === "active" ? "Giá hiện tại" : "Giá cuối cùng"}
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                {type === "active" ? "Số lượt bid" : "Người thắng cuộc"}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian còn lại
              </div>
            </TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const priceDisplay = product.currentPrice
              ? formatPrice(parseInt(product.currentPrice, 10))
              : "Chưa có giá thầu";

            const timeDisplay = formatTimeRemaining(product.endTime);

            const winnerDisplay =
              type === "active"
                ? product.bidCount
                : product.currentWinnerName || "Không có";

            const buttonText = type === "active" ? "Chỉnh sửa" : "Xem chi tiết";
            const buttonLink =
              type === "active"
                ? SELLER_ROUTES.PRODUCT(product.id)
                : APP_ROUTES.PRODUCT(product.id);

            return (
              <TableRow key={product.id}>
                <TableCell>
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
                </TableCell>
                <TableCell className="font-medium">
                  <Link to={APP_ROUTES.PRODUCT(product.id)}>
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>{priceDisplay}</TableCell>
                <TableCell>
                  {type === "active" ? (
                    <div className="flex items-center gap-2">
                      <Gavel className="text-muted-foreground h-4 w-4" />
                      <span>{winnerDisplay}</span>
                    </div>
                  ) : (
                    winnerDisplay
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>{timeDisplay}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  {type === "active" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={buttonLink}>
                        <Edit className="mr-2 h-4 w-4" />
                        {buttonText}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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

export default SellerProductTable;
