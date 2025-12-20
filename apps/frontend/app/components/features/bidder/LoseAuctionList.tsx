import type { MyAutoBid } from "@repo/shared-types";
import { Package } from "lucide-react";
import { Link } from "react-router";

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
import { APP_ROUTES } from "@/constants/routes";
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
                    {/* {bid.product.name} */}
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
