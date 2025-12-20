import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { Eye, Package } from "lucide-react";
import { Link } from "react-router";

import OrderStatusBadge from "@/components/common/OrderStatusBadge";
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

/**
 * Component: WonAuctionList
 * Displays a list of won auctions for the current user.
 */
const WonAuctionList = ({ wonBids, orders }: WonAuctionListProps) => {
  // Tạo map từ productId đến order để dễ dàng lookup
  const orderMap = new Map(orders.map((order) => [order.productId, order]));

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
            {wonBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-4 text-center">
                  Không có đấu giá đã thắng.
                </TableCell>
              </TableRow>
            ) : (
              wonBids.map((bid) => {
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
    </TabsContent>
  );
};

export default WonAuctionList;
