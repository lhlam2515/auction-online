import type {
  User,
  MyAutoBid,
  Order,
  OrderWithDetails,
} from "@repo/shared-types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
import { ERROR_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { formatPrice } from "@/lib/utils";

// TODO: Define props based on SRS requirements
type WonAuctionListProps = {
  className?: string;
  [key: string]: any;
};

/**
 * Component: WonAuctionList
 * Generated automatically based on Project Auction SRS.
 */
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
const WonAuctionList = (props: WonAuctionListProps) => {
  const [userOrder, setUserOrder] = useState<OrderWithDetails[]>([]);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        const orderRes = await api.orders.getAll();

        if (orderRes?.success && orderRes.data) {
          setUserOrder(orderRes.data.items);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      }
    };
    fetchUserDate();
  }, []);

  const now = new Date();
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
            {userOrder.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell className="font-medium">
                  {auction.product.name}
                </TableCell>
                <TableCell>
                  {formatPrice(Number(auction.finalPrice || "0"))}
                </TableCell>
                <TableCell>{auction.createdAt.toString()}</TableCell>
                <TableCell>{getStatusBadge(auction.status)}</TableCell>
                <TableCell className="text-right">
                  {auction.status === "PENDING" && (
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      Thanh toán
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};

export default WonAuctionList;
