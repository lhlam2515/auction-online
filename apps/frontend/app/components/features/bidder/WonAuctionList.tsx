import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { useNavigate } from "react-router";

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
import { ACCOUNT_ROUTES } from "@/constants/routes";
import { formatDate, formatPrice } from "@/lib/utils";

function getStatusBadge(
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED"
) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700"
        >
          Chưa thanh toán
        </Badge>
      );
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="border-green-300 bg-amber-50 text-amber-700"
        >
          Đã thanh toán
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-50 text-blue-700"
        >
          Đã vận chuyển
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 text-emerald-700"
        >
          Hoàn thành
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-red-300 bg-red-50 text-red-700"
        >
          Đã hủy
        </Badge>
      );
  }
}

type WonAuctionListProps = {
  wonBids: MyAutoBid[];
  orders: OrderWithDetails[];
};

/**
 * Component: WonAuctionList
 * Displays a list of won auctions for the current user.
 */
const WonAuctionList = ({ wonBids, orders }: WonAuctionListProps) => {
  const navigate = useNavigate();
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
              <TableHead className="text-right">Hành động</TableHead>
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
                      {bid.product.name}
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
                      {order ? (
                        getStatusBadge(order.status)
                      ) : (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                          Đã thắng
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {order && (
                        <Button
                          size="sm"
                          className={
                            order.status === "PENDING"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-300"
                          }
                          onClick={() =>
                            navigate(ACCOUNT_ROUTES.ORDER(order.id))
                          }
                        >
                          {order.status === "PENDING"
                            ? "Thanh toán"
                            : "Xem chi tiết"}
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
