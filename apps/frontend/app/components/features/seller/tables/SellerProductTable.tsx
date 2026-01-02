import type { ProductListing } from "@repo/shared-types";
import { Edit, Eye } from "lucide-react";
import { Link } from "react-router";

import {
  ProductTable,
  type ProductTableAction,
} from "@/components/features/product";
import { Button } from "@/components/ui/button";
import { APP_ROUTES, SELLER_ROUTES } from "@/constants/routes";

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
  const emptyMessage =
    type === "active"
      ? "Danh sách sản phẩm đang đấu giá sẽ hiển thị ở đây"
      : "Danh sách sản phẩm đã kết thúc phiên đấu giá sẽ hiển thị ở đây";

  const displayMode = type === "active" ? "active" : "ended";

  const actions: ProductTableAction[] = [
    {
      key: "edit",
      render: (product: ProductListing) => (
        <Button variant="default" size="sm" asChild>
          <Link to={SELLER_ROUTES.PRODUCT(product.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Link>
        </Button>
      ),
      hidden: (product: ProductListing) =>
        new Date(product.endTime) <= new Date(),
    },
    {
      key: "view",
      render: (product: ProductListing) => (
        <Button variant="default" size="sm" asChild>
          <Link to={APP_ROUTES.PRODUCT(product.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <ProductTable
      products={products}
      displayMode={displayMode}
      actions={actions}
      emptyMessage={emptyMessage}
      className={className}
    />
  );
};

export default SellerProductTable;
