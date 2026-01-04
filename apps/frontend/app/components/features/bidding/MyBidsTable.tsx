import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { PaginationBar } from "@/components/common";
import { OrderStatusBadge } from "@/components/common/badges";
import { ProductCell } from "@/components/features/product/display";
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
import { TabsContent } from "@/components/ui/tabs";
import { ACCOUNT_ROUTES } from "@/constants/routes";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type BidsTableVariant = "active" | "won" | "lost";

type BidsTableProps = {
  variant: BidsTableVariant;
  bids: MyAutoBid[];
  orders?: OrderWithDetails[];
};

const VARIANT_CONFIG = {
  active: {
    tabValue: "active",
    emptyMessage: "Không có đấu giá đang hoạt động.",
    columns: [
      "Sản phẩm",
      "Giá hiện tại",
      "Giá tối đa của bạn",
      "Kết thúc",
      "Trạng thái",
    ],
  },
  won: {
    tabValue: "won",
    emptyMessage: "Không có đấu giá đã thắng.",
    columns: [
      "Sản phẩm",
      "Giá cuối",
      "Ngày đấu giá",
      "Trạng thái",
      "Hành động",
    ],
  },
  lost: {
    tabValue: "lost",
    emptyMessage: "Không có đấu giá đã thua.",
    columns: [
      "Sản phẩm",
      "Giá cuối",
      "Giá tối đa của bạn",
      "Kết thúc",
      "Trạng thái",
    ],
  },
} as const;

const ITEMS_PER_PAGE = 5;

/**
 * Unified bids table component with support for active, won, and lost auctions
 */
const MyBidsTable = ({ variant, bids, orders = [] }: BidsTableProps) => {
  const config = VARIANT_CONFIG[variant];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(bids.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return bids.slice(start, start + ITEMS_PER_PAGE);
  }, [bids, currentPage]);

  // Create order map for won bids
  const orderMap = useMemo(
    () => new Map(orders.map((order) => [order.productId, order])),
    [orders]
  );

  const renderRow = (bid: MyAutoBid) => {
    switch (variant) {
      case "active":
        return <ActiveBidRow key={bid.id} bid={bid} />;
      case "won":
        return (
          <WonBidRow
            key={bid.id}
            bid={bid}
            order={orderMap.get(bid.productId)}
          />
        );
      case "lost":
        return <LostBidRow key={bid.id} bid={bid} />;
    }
  };

  return (
    <TabsContent value={config.tabValue} className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={config.columns.length}
                  className="py-4 text-center"
                >
                  {config.emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map(renderRow)
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </TabsContent>
  );
};

export default MyBidsTable;

/**
 * Active bid row component
 */
const ActiveBidRow = ({ bid }: { bid: MyAutoBid }) => {
  const isLeading =
    bid.product.winnerId === null || bid.product.winnerId === bid.userId;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <ProductCell
          productId={bid.productId}
          name={bid.product.name}
          imageUrl={bid.product.imageUrl}
        />
      </TableCell>
      <TableCell>
        {formatPrice(Number(bid.product.currentPrice || 0))}
      </TableCell>
      <TableCell>{formatPrice(Number(bid.maxAmount || 0))}</TableCell>
      <TableCell>{formatDate(bid.product.endTime)}</TableCell>
      <TableCell>
        {isLeading ? (
          <Badge className="bg-emerald-600 text-emerald-50">Đang dẫn đầu</Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-600"
          >
            Bị vượt
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
};

/**
 * Won bid row component
 */
const WonBidRow = ({
  bid,
  order,
}: {
  bid: MyAutoBid;
  order?: OrderWithDetails;
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <ProductCell
          productId={bid.productId}
          name={bid.product.name}
          imageUrl={bid.product.imageUrl}
        />
      </TableCell>
      <TableCell>
        {formatPrice(Number(bid.product.currentPrice || 0))}
      </TableCell>
      <TableCell>
        {order ? formatDate(order.createdAt) : formatDate(bid.product.endTime)}
      </TableCell>
      <TableCell>
        {order && <OrderStatusBadge status={order.status} />}
      </TableCell>
      <TableCell>
        {order && (
          <Button
            size="sm"
            className={cn(
              order.status === "PENDING" &&
                "border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-600"
            )}
            asChild
          >
            <Link to={ACCOUNT_ROUTES.ORDER(order.id)}>
              {order.status === "PENDING" ? (
                "Thanh toán"
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Xem chi tiết</span>
                </>
              )}
            </Link>
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

/**
 * Lost bid row component
 */
const LostBidRow = ({ bid }: { bid: MyAutoBid }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <ProductCell
          productId={bid.productId}
          name={bid.product.name}
          imageUrl={bid.product.imageUrl}
        />
      </TableCell>
      <TableCell>
        {formatPrice(Number(bid.product.currentPrice || 0))}
      </TableCell>
      <TableCell>{formatPrice(Number(bid.maxAmount || 0))}</TableCell>
      <TableCell>{formatDate(bid.product.endTime)}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="border-red-300 bg-red-50 text-red-600"
        >
          Đã thua
        </Badge>
      </TableCell>
    </TableRow>
  );
};
