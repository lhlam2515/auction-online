import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import {
  AlertTriangle,
  CreditCard,
  Eye,
  Gavel,
  Search,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { PaginationBar } from "@/components/common";
import { OrderStatusBadge } from "@/components/common/badges";
import { ProductCell } from "@/components/features/product/display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ACCOUNT_ROUTES, APP_ROUTES } from "@/constants/routes";
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
    emptyTitle: "Chưa có đấu giá nào đang hoạt động",
    emptyDescription:
      "Bạn chưa tham gia đấu giá nào. Khám phá các sản phẩm hấp dẫn và bắt đầu đấu giá ngay!",
    emptyIcon: Gavel,
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
    emptyTitle: "Chưa có đấu giá nào chiến thắng",
    emptyDescription:
      "Bạn chưa thắng bất kỳ cuộc đấu giá nào. Tiếp tục tham gia để giành chiến thắng!",
    emptyIcon: Trophy,
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
    emptyTitle: "Không có đấu giá nào bị thua",
    emptyDescription:
      "Tuyệt vời! Bạn chưa thua bất kỳ cuộc đấu giá nào. Hãy tiếp tục phát huy!",
    emptyIcon: XCircle,
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

  // Show empty state if no bids
  if (bids.length === 0) {
    const EmptyIcon = config.emptyIcon;

    return (
      <TabsContent value={config.tabValue} className="space-y-4">
        <Empty className="from-muted/60 to-background h-full border bg-linear-to-b from-30%">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <EmptyIcon />
            </EmptyMedia>
            <EmptyTitle>{config.emptyTitle}</EmptyTitle>
            <EmptyDescription>{config.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="default">
                <Link to={APP_ROUTES.SEARCH}>
                  <Search className="h-4 w-4" />
                  Khám phá sản phẩm
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={APP_ROUTES.HOME}>Về trang chủ</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </TabsContent>
    );
  }

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
          <TableBody>{paginatedItems.map(renderRow)}</TableBody>
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
          <Badge className="bg-emerald-600 text-emerald-50">
            <Trophy className="mr-1 h-3 w-3" />
            Đang dẫn đầu
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-600"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
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
                "bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700"
            )}
            asChild
          >
            <Link to={ACCOUNT_ROUTES.ORDER(order.id)}>
              {order.status === "PENDING" ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Thanh toán</span>
                </>
              ) : order.status === "COMPLETED" ? (
                <>
                  <Star className="h-4 w-4" />
                  <span>Đánh giá</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Theo dõi</span>
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
          className="bg-destructive/10 border-destructive/20 text-destructive"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Đã thua
        </Badge>
      </TableCell>
    </TableRow>
  );
};
