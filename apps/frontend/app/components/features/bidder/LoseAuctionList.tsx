import type { MyAutoBid } from "@repo/shared-types";

import { Badge } from "@/components/ui/badge";
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

type LoseAuctionListProps = {
  lostBids: MyAutoBid[];
};

/**
 * Component: LoseAuctionList
 * Displays a list of lost auctions for the current user.
 */
const LoseAuctionList = ({ lostBids }: LoseAuctionListProps) => {
  return (
    <TabsContent value="lost" className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá cuối</TableHead>
              <TableHead>Giá tối đa của bạn</TableHead>
              <TableHead>Kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lostBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-4 text-center">
                  Không có đấu giá đã thua.
                </TableCell>
              </TableRow>
            ) : (
              lostBids.map((bid) => (
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
                    <Badge
                      variant="outline"
                      className="border-red-300 bg-red-50 text-red-700"
                    >
                      Đã thua
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};

export default LoseAuctionList;
