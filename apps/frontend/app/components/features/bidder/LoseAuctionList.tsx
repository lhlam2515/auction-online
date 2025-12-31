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

type LoseAuctionListProps = {
  lostBids: MyAutoBid[];
};

const ITEMS_PER_PAGE = 5;

/**
 * Component: LoseAuctionList
 * Displays a list of lost auctions for the current user.
 */
const LoseAuctionList = ({ lostBids }: LoseAuctionListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(lostBids.length / ITEMS_PER_PAGE);
  const paginatedBids = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return lostBids.slice(start, start + ITEMS_PER_PAGE);
  }, [lostBids, currentPage]);

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
            {paginatedBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-4 text-center">
                  Không có đấu giá đã thua.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBids.map((bid) => (
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

      <div className="mt-4">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages > 0 ? totalPages : 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </TabsContent>
  );
};

export default LoseAuctionList;
