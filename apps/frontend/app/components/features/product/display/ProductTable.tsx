import type { ProductListing } from "@repo/shared-types";
import { Package, Gavel, Clock } from "lucide-react";
import type { ReactNode } from "react";

import { ProductStatusBadge } from "@/components/common/badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate, formatPrice, formatTimeRemaining } from "@/lib/utils";

import ProductCell from "./ProductCell";

export type ProductTableColumn = {
  key: string;
  header: string | ReactNode;
  render?: (product: ProductListing) => ReactNode;
  className?: string;
};

export type ProductTableAction = {
  key: string;
  label?: string;
  icon?: ReactNode;
  onClick?: (product: ProductListing) => void;
  render?: (product: ProductListing) => ReactNode;
  hidden?: (product: ProductListing) => boolean;
};

type ProductTableProps = {
  products: ProductListing[];
  columns?: ProductTableColumn[];
  actions?: ProductTableAction[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  displayMode?: "active" | "ended" | "all";
  className?: string;
  onRowClick?: (product: ProductListing) => void;
};

const DEFAULT_COLUMNS: ProductTableColumn[] = [
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
    className: "whitespace-normal",
  },
  {
    key: "price",
    header: "Giá hiện tại",
    render: (product) =>
      product.currentPrice
        ? formatPrice(parseInt(product.currentPrice, 10))
        : "Chưa có giá thầu",
  },
  {
    key: "bidCount",
    header: (
      <div className="flex items-center gap-2">
        <Gavel className="h-4 w-4" />
        Số lượt bid
      </div>
    ),
    render: (product) => (
      <div className="flex items-center gap-2">
        <Gavel className="text-muted-foreground h-4 w-4" />
        {product.bidCount}
      </div>
    ),
  },
  {
    key: "timeRemaining",
    header: (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Thời gian còn lại
      </div>
    ),
    render: (product) => (
      <div className="flex items-center gap-2">
        <Clock className="text-muted-foreground h-4 w-4" />
        {formatTimeRemaining(new Date(product.endTime))}
      </div>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (product) => <ProductStatusBadge status={product.status} />,
  },
];

const ProductTable = ({
  products,
  columns,
  actions,
  emptyMessage = "Danh sách sản phẩm sẽ hiển thị ở đây",
  emptyIcon,
  displayMode = "all",
  className,
  onRowClick,
}: ProductTableProps) => {
  let finalColumns = columns || DEFAULT_COLUMNS;

  if (displayMode === "ended") {
    finalColumns = finalColumns.map((col) => {
      if (col.key === "timeRemaining") {
        return {
          key: "endTime",
          header: (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ngày kết thúc
            </div>
          ),
          render: (product) => (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(new Date(product.endTime))}
            </div>
          ),
        };
      }

      if (col.key === "bidCount") {
        return {
          key: "winner",
          header: (
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Người thắng cuộc
            </div>
          ),
          render: (product) => product.currentWinnerName || "Không có",
        };
      }

      return col;
    });
  }

  if (!products || products.length === 0) {
    return (
      <div
        className={cn(
          "bg-muted/60 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed",
          className
        )}
      >
        <div className="text-center">
          {emptyIcon || (
            <Package className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
          )}
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
            {finalColumns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && <TableHead>Hành động</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              onClick={onRowClick ? () => onRowClick(product) : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {finalColumns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(product) : null}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {actions
                      .filter(
                        (action) => !action.hidden || !action.hidden(product)
                      )
                      .map((action) =>
                        action.render ? (
                          <div key={action.key}>{action.render(product)}</div>
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

export default ProductTable;
