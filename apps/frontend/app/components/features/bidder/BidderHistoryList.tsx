import type { MyAutoBid } from "@repo/shared-types";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import PaginationBar from "@/components/features/product/PaginationBar";
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

type BidderHistoryListProps = {
  activeBids: MyAutoBid[];
};

const ITEMS_PER_PAGE = 5;

/**
 * Component: BidderHistoryList
 * Displays a list of active bids for the current user.
 */
const BidderHistoryList = ({ activeBids }: BidderHistoryListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActiveBids = useMemo(() => {
    const now = new Date();
    return activeBids.filter((bid) => new Date(bid.product.endTime) > now);
  }, [activeBids]);

  const totalPages = Math.ceil(filteredActiveBids.length / ITEMS_PER_PAGE);
  const paginatedBids = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActiveBids.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActiveBids, currentPage]);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  Không có đấu giá đang hoạt động.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBids.map((bid) => {
                const isLeading =
                  Number(bid.product.currentPrice) <= Number(bid.maxAmount);
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

export default BidderHistoryList;
