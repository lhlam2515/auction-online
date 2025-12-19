import type { User, MyAutoBid, Order } from "@repo/shared-types";
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
import { formatDate, formatPrice } from "@/lib/utils";

// TODO: Define props based on SRS requirements
type BidderHistoryListProps = {
  className?: string;
  [key: string]: any;
};

/**
 * Component: BidderHistoryList
 * Generated automatically based on Project Auction SRS.
 */
const BidderHistoryList = (props: BidderHistoryListProps) => {
  const [activeBidsData, setActiveBidsData] = useState<MyAutoBid[]>([]);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        const bidsRes = await api.bids.getMyAutoBid();
        console.log(bidsRes);
        if (bidsRes?.success && bidsRes.data) {
          setActiveBidsData(bidsRes.data);
          console.log("Hello");
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
            {activeBidsData
              .filter((bid) => new Date(bid.product.endTime) > now)
              .map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">
                    {bid.product.productName}
                  </TableCell>
                  <TableCell>
                    {formatPrice(Number(bid.product.currentPrice || 0))}
                  </TableCell>
                  <TableCell>
                    {formatPrice(Number(bid.maxAmount || 0))}
                  </TableCell>
                  <TableCell>{formatDate(bid.product.endTime)}</TableCell>
                  <TableCell>
                    {Number(bid.product.currentPrice) <=
                    Number(bid.maxAmount) ? (
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
                    {Number(bid.product.currentPrice) >
                      Number(bid.maxAmount) && (
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
              ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};

export default BidderHistoryList;
