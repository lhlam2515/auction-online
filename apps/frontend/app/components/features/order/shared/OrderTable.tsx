import type { OrderWithDetails } from "@repo/shared-types";
import { Package } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { AppEmptyState } from "@/components/common";
import { OrderStatusBadge } from "@/components/common/badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_ROUTES } from "@/constants/routes";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export type OrderTableColumn = {
  key: string;
  header: string | ReactNode;
  render?: (order: OrderWithDetails) => ReactNode;
  className?: string;
};

export type OrderTableAction = {
  key: string;
  label?: string;
  icon?: ReactNode;
  onClick?: (order: OrderWithDetails) => void;
  render?: (order: OrderWithDetails) => ReactNode;
  hidden?: (order: OrderWithDetails) => boolean;
};

type OrderTableProps = {
  orders: OrderWithDetails[];
  columns?: OrderTableColumn[];
  actions?: OrderTableAction[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  className?: string;
  onRowClick?: (order: OrderWithDetails) => void;
};

const DEFAULT_COLUMNS: OrderTableColumn[] = [
  {
    key: "orderNumber",
    header: "Mã đơn hàng",
    render: (order) => <span className="font-medium">{order.orderNumber}</span>,
  },
  {
    key: "product",
    header: "Sản phẩm",
    render: (order) => (
      <div className="flex items-center gap-3">
        {order.product?.thumbnail ? (
          <img
            src={order.product.thumbnail}
            alt={order.product.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded">
            <Package className="text-muted-foreground h-5 w-5" />
          </div>
        )}
        <div>
          {order.product && order.productId ? (
            <Link
              to={APP_ROUTES.PRODUCT(order.productId)}
              className="font-medium hover:underline"
            >
              {order.product.name}
            </Link>
          ) : (
            <span className="text-muted-foreground italic">
              Sản phẩm không khả dụng
            </span>
          )}
        </div>
      </div>
    ),
    className: "whitespace-normal",
  },
  {
    key: "buyer",
    header: "Người mua",
    render: (order) => (
      <div>
        {order.winner ? (
          <>
            <p className="font-medium">{order.winner.fullName}</p>
            <p className="text-muted-foreground text-sm">
              {order.winner.email}
            </p>
          </>
        ) : (
          <span className="text-muted-foreground italic">
            Người mua không khả dụng
          </span>
        )}
      </div>
    ),
  },
  {
    key: "totalAmount",
    header: "Tổng tiền",
    render: (order) => (
      <span className="font-medium">
        {formatPrice(parseInt(order.totalAmount, 10))}
      </span>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (order) => <OrderStatusBadge status={order.status} />,
  },
  {
    key: "createdAt",
    header: "Ngày đặt",
    render: (order) => formatDate(order.createdAt),
  },
];

const OrderTable = ({
  orders,
  columns,
  actions,
  emptyMessage = "Chưa có đơn hàng nào được tạo.",
  emptyIcon,
  emptyAction,
  className,
  onRowClick,
}: OrderTableProps) => {
  const finalColumns = columns || DEFAULT_COLUMNS;

  if (!orders || orders.length === 0) {
    return (
      <AppEmptyState
        title={emptyMessage}
        icon={emptyIcon || <Package />}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {finalColumns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && <TableHead>Hành động</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              onClick={onRowClick ? () => onRowClick(order) : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {finalColumns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(order) : null}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {actions
                      .filter(
                        (action) => !action.hidden || !action.hidden(order)
                      )
                      .map((action) =>
                        action.render ? (
                          <div key={action.key}>{action.render(order)}</div>
                        ) : null
                      )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
