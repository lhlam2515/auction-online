import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { Eye, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import PaginationBar from "@/components/features/product/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ACCOUNT_ROUTES, APP_ROUTES } from "@/constants/routes";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type WonAuctionListProps = {
  wonBids: MyAutoBid[];
  orders: OrderWithDetails[];
};

const ITEMS_PER_PAGE = 5;

/**
 * Component: WonAuctionList
 * Displays a list of won auctions for the current user.
 */
const WonAuctionList = ({ wonBids, orders }: WonAuctionListProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Tạo map từ productId đến order để dễ dàng lookup
  const orderMap = new Map(orders.map((order) => [order.productId, order]));

  const totalPages = Math.ceil(wonBids.length / ITEMS_PER_PAGE);
  const paginatedBids = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return wonBids.slice(start, start + ITEMS_PER_PAGE);
  }, [wonBids, currentPage]);

  return (
    <TabsContent value="won" className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá cuối</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-4 text-center">
                  Không có đấu giá đã thắng.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBids.map((bid) => {
                const order = orderMap.get(bid.productId);
                return (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {bid.product.imageUrl ? (
                          <img
                            src={bid.product.imageUrl}
                            alt={bid.product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={APP_ROUTES.PRODUCT(bid.productId)}
                            className="font-medium hover:underline"
                          >
                            {bid.product.name}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPrice(Number(bid.product.currentPrice || 0))}
                    </TableCell>
                    <TableCell>
                      {order
                        ? formatDate(order.createdAt)
                        : formatDate(bid.product.endTime)}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </TabsContent>
  );
};

export default WonAuctionList;
