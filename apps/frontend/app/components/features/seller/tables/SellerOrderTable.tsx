import type { OrderWithDetails } from "@repo/shared-types";
import { Eye } from "lucide-react";
import { Link } from "react-router";

import { OrderTable, type OrderTableAction } from "@/components/features/order";
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
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <OrderTable
      orders={orders}
      actions={actions}
      emptyMessage="Chưa có đơn hàng nào được tạo."
      className={className}
    />
  );
};

export default SellerOrderTable;
