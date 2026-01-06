import type { BidWithUser, ProductDetails } from "@repo/shared-types";
import { ChevronDown, ChevronUp, Gavel } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";

import { RatingBadge } from "@/components/common";
import { KickBidderDialog } from "@/components/features/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";
import { formatDate, formatPrice } from "@/lib/utils";

interface BidHistoryTableProps {
  product: ProductDetails;
  userId?: string;
  canKick: boolean;
  isAuthLoading: boolean;
  onRefresh?: () => void;
  className?: string;
}

const BidHistoryTable = ({
  product,
  userId,
  canKick,
  isAuthLoading,
  onRefresh,
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
  }, [isAuthLoading, product, isSeller]);

  const displayedBids = showAll ? bids : bids.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <Gavel className="text-muted-foreground h-5 w-5" />
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
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-center">
            <Spinner className="size-5" />
            Đang tải lịch sử đấu giá...
          </div>
        ) : bids.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Gavel className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Chưa có lượt đấu giá nào</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người đấu giá</TableHead>
                  <TableHead>Điểm đánh giá</TableHead>
                  <TableHead className="text-right">Giá đặt</TableHead>
                  {canKick && (
                    <TableHead className="text-center">Hành động</TableHead>
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
                        index === 0 ? "bg-green-50 dark:bg-green-950" : ""
                      }
                    >
                      <TableCell>{formatDate(bidDateTime)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          {isSeller ? (
                            <Link
                              to={APP_ROUTES.PROFILE(bid.userId)}
                              className="hover:underline"
                            >
                              {bid.userName}
                            </Link>
                          ) : (
                            bid.userName
                          )}
                          {index === 0 && (
                            <Badge className="bg-green-600">
                              Người thắng hiện tại
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RatingBadge score={bid.ratingScore} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(Number(bid.amount))}
                      </TableCell>
                      {canKick && (
                        <TableCell className="text-center">
                          <KickBidderDialog
                            bidderId={bid.userId}
                            productId={product.id}
                            bidderName={bid.userName}
                            onSuccess={onRefresh}
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
                className="w-full cursor-pointer"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Xem thêm ({bids.length - 5} lượt đặt giá)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistoryTable;
