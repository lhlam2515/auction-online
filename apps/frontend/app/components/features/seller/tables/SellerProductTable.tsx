import type { ProductListing } from "@repo/shared-types";
import { Edit } from "lucide-react";
import { Link } from "react-router";

import {
  ProductTable,
  type ProductTableAction,
} from "@/components/features/product/display";
import { Button } from "@/components/ui/button";
import { SELLER_ROUTES } from "@/constants/routes";

import CreateProductButton from "../CreateProductButton";

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
      ? "Chưa có sản phẩm đấu giá nào đang hoạt động"
      : "Chưa có sản phẩm đấu giá nào đã kết thúc";

  const displayMode = type === "active" ? "active" : "ended";

  const actions: ProductTableAction<ProductListing>[] = [];

  if (displayMode === "active") {
    actions.push({
      key: "edit",
      render: (product: ProductListing) => (
        <Button variant="default" size="sm" asChild>
          <Link to={SELLER_ROUTES.PRODUCT(product.id)}>
            <Edit className="mr-1 h-4 w-4" />
            Chỉnh sửa
          </Link>
        </Button>
      ),
      hidden: (product: ProductListing) =>
        new Date(product.endTime) <= new Date(),
    });
  }

  return (
    <ProductTable
      products={products}
      displayMode={displayMode}
      actions={actions}
      emptyMessage={emptyMessage}
      emptyAction={<CreateProductButton variant="default" size="sm" />}
      className={className}
    />
  );
};

export default SellerProductTable;
