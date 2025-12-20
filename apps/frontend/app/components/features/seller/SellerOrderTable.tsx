import type { OrderWithDetails } from "@repo/shared-types";
import { Package, Eye, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
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
import { cn, formatDate, formatPrice } from "@/lib/utils";

type SellerOrderTableProps = {
  orders: OrderWithDetails[];
  className?: string;
};

const SellerOrderTable = ({ orders, className }: SellerOrderTableProps) => {
  if (!orders || orders.length === 0) {
    return (
      <div
        className={cn(
          "bg-muted/60 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed",
          className
        )}
      >
        <div className="text-center">
          <Package className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
          <p className="text-muted-foreground mt-2">
            Danh sách đơn hàng sẽ hiển thị ở đây
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "Chờ xử lý",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        icon: Clock,
      },
      PAID: {
        variant: "secondary" as const,
        label: "Đã thanh toán",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        icon: CheckCircle,
      },
      SHIPPED: {
        variant: "secondary" as const,
        label: "Đã giao hàng",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        icon: Truck,
      },
      COMPLETED: {
        variant: "secondary" as const,
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: CheckCircle,
      },
      CANCELLED: {
        variant: "secondary" as const,
        label: "Đã hủy",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Người mua</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {order.product.thumbnail ? (
                    <img
                      src={order.product.thumbnail}
                      alt={order.product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={APP_ROUTES.PRODUCT(order.productId)}
                      className="font-medium hover:underline"
                    >
                      {order.product.name}
                    </Link>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.winner.fullName}</p>
                  <p className="text-muted-foreground text-sm">
                    {order.winner.email}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(parseInt(order.totalAmount, 10))}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link to={SELLER_ROUTES.ORDER(order.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SellerOrderTable;
