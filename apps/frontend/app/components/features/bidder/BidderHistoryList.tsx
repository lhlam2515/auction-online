import type { MyAutoBid } from "@repo/shared-types";
import { useMemo } from "react";

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
import { formatDate, formatPrice } from "@/lib/utils";

type BidderHistoryListProps = {
  activeBids: MyAutoBid[];
};

/**
 * Component: BidderHistoryList
 * Displays a list of active bids for the current user.
 */
const BidderHistoryList = ({ activeBids }: BidderHistoryListProps) => {
  const filteredActiveBids = useMemo(() => {
    const now = new Date();
    return activeBids.filter((bid) => new Date(bid.product.endTime) > now);
  }, [activeBids]);

  return (
    <TabsContent value="active" className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá hiện tại</TableHead>
              <TableHead>Giá tối đa của bạn</TableHead>
              <TableHead>Kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActiveBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  Không có đấu giá đang hoạt động.
                </TableCell>
              </TableRow>
            ) : (
              filteredActiveBids.map((bid) => {
                const isLeading =
                  Number(bid.product.currentPrice) <= Number(bid.maxAmount);

                return (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      {bid.product.name}
                    </TableCell>
                    <TableCell>
                      {formatPrice(Number(bid.product.currentPrice || 0))}
                    </TableCell>
                    <TableCell>
                      {formatPrice(Number(bid.maxAmount || 0))}
                    </TableCell>
                    <TableCell>{formatDate(bid.product.endTime)}</TableCell>
                    <TableCell>
                      {isLeading ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                          Đang dẫn đầu
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-300 bg-amber-50 text-amber-700"
                        >
                          Bị trả giá
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isLeading && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 bg-transparent text-amber-700"
                        >
                          Đấu lại
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

export default BidderHistoryList;
