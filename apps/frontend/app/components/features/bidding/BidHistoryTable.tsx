import type { BidWithUser, ProductDetails } from "@repo/shared-types";
import { Star, ChevronDown, ChevronUp, Gavel, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { KickBidderDialog } from "@/components/features/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";
import { formatDate, formatPrice } from "@/lib/utils";

interface BidHistoryTableProps {
  product: ProductDetails;
  userId?: string;
  canKick: boolean;
  isAuthLoading: boolean;
  className?: string;
}

const BidHistoryTable = ({
  product,
  userId,
  canKick,
  isAuthLoading,
  className,
}: BidHistoryTableProps) => {
  const [bids, setBids] = useState<BidWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const isSeller = userId === product.sellerId;

  useEffect(() => {
    // Chỉ fetch khi auth đã load xong để tránh fetch duplicate
    let isMounted = true;

    const fetchBidHistory = async () => {
      try {
        setLoading(true);
        if (isAuthLoading) return;
        logger.info("Fetching bid history for product:", {
          productId: product.id,
          isSeller,
        });
        const response = isSeller
          ? await api.bids.getBiddingHistoryForSeller(product.id)
          : await api.bids.getHistory(product.id);

        if (!isMounted) return;

        if (response.success && response.data) {
          setBids(response.data);
        } else {
          throw new Error("Không thể tải lịch sử đấu giá");
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(
            error,
            "Có lỗi khi tải lịch sử đấu giá"
          );
          showError(error, errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBidHistory();
    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, product.id, isSeller]);

  const handleKickSuccess = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const displayedBids = showAll ? bids : bids.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <Gavel className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          Lịch sử đấu giá
          {!loading && (
            <span className="text-muted-foreground text-sm">
              ({bids.length} lượt đặt giá)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center">
            <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin" />
            Đang tải lịch sử đấu giá...
          </p>
        ) : bids.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Gavel className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Chưa có lượt đấu giá nào</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người đấu giá</TableHead>
                  <TableHead>Điểm đánh giá</TableHead>
                  <TableHead className="text-right">Giá đặt</TableHead>
                  {canKick && (
                    <TableHead className="text-right">Hành động</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBids.map((bid, index) => {
                  const bidDateTime = new Date(bid.createdAt);

                  return (
                    <TableRow
                      key={bid.id}
                      className={
                        index === 0 ? "bg-emerald-50 dark:bg-emerald-950" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {formatDate(bidDateTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {bid.userName}
                          {index === 0 && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">
                              Người thắng hiện tại
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-semibold text-amber-500">
                            {bid.ratingScore * 100}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(Number(bid.amount))}
                      </TableCell>
                      {canKick && (
                        <TableCell className="text-right">
                          <KickBidderDialog
                            bidderId={bid.userId}
                            productId={product.id}
                            onSuccess={handleKickSuccess}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {bids.length > 5 && (
              <Button
                variant="outline"
                className="w-full cursor-pointer bg-transparent"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Xem thêm ({bids.length - 5} lượt đặt giá)
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistoryTable;
