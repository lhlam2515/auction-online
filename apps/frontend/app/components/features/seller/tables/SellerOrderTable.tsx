import type { OrderWithDetails } from "@repo/shared-types";
import { Eye, Star, LayoutDashboard } from "lucide-react";
import { Link } from "react-router";

import {
  type OrderTableAction,
  OrderTable,
} from "@/components/features/order/shared";
import { Button } from "@/components/ui/button";
import { SELLER_ROUTES } from "@/constants/routes";

type SellerOrderTableProps = {
  orders: OrderWithDetails[];
  className?: string;
};

const SellerOrderTable = ({ orders, className }: SellerOrderTableProps) => {
  const actions: OrderTableAction[] = [
    {
      key: "view",
      render: (order: OrderWithDetails) => (
        <Button variant="default" size="sm" asChild>
          <Link to={SELLER_ROUTES.ORDER(order.id)}>
            <Eye className="h-4 w-4" />
            Theo dõi
          </Link>
        </Button>
      ),
      hidden: (order: OrderWithDetails) => order.status === "COMPLETED",
    },
    {
      key: "rating",
      render: (order: OrderWithDetails) => (
        <Button variant="default" size="sm" asChild>
          <Link to={SELLER_ROUTES.ORDER(order.id)}>
            <Star className="h-4 w-4" />
            Đánh giá
          </Link>
        </Button>
      ),
      hidden: (order: OrderWithDetails) => order.status !== "COMPLETED",
    },
  ];

  return (
    <OrderTable
      orders={orders}
      actions={actions}
      emptyMessage="Chưa có đơn hàng nào được tạo."
      emptyAction={
        <Button asChild variant="default">
          <Link to={SELLER_ROUTES.DASHBOARD}>
            <LayoutDashboard className="h-4 w-4" />
            Về Dashboard
          </Link>
        </Button>
      }
      className={className}
    />
  );
};

export default SellerOrderTable;
