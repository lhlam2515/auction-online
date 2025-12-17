import type { BidWithUser } from "@repo/shared-types";
import { Star, ChevronDown, ChevronUp, Gavel, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
import logger from "@/lib/logger";
import { formatDate, formatPrice } from "@/lib/utils";

import { KickDialog } from "./KickDialog";

interface HistoryTableProps {
  productId: string;
  isSeller: boolean;
  isEnded: boolean;
  className?: string;
  [key: string]: any;
}

export function HistoryTable({
  productId,
  isSeller,
  isEnded,
  className,
}: HistoryTableProps) {
  const [bids, setBids] = useState<BidWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [kickDialog, setKickDialog] = useState<{
    open: boolean;
    bidder?: BidWithUser;
  }>({ open: false });

  const fetchBidHistory = async (isMounted: boolean) => {
    try {
      setLoading(true);
      const response = await api.bids.getHistory(productId);

      if (isMounted) {
        if (response.success && response.data) {
          setBids(response.data);
        } else {
          toast.error("Không thể tải lịch sử đấu giá");
        }
      }
    } catch (err) {
      if (isMounted) {
        toast.error("Có lỗi khi tải lịch sử đấu giá");
        logger.error("Error fetching bid history:", err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchBidHistory(isMounted);
    return () => {
      isMounted = false;
    };
  }, [productId]);

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
                  {isSeller && !isEnded && (
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
                            {bid.ratingScore}/10
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(Number(bid.amount))}
                      </TableCell>
                      {isSeller && !isEnded && (
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                            onClick={() =>
                              setKickDialog({ open: true, bidder: bid })
                            }
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
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
                className="w-full bg-transparent"
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
                    Xem thêm ({bids.length - 5} lượt đấu giá)
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Kick Bidder Dialog */}
        <KickDialog
          open={kickDialog.open}
          onOpenChange={(open) => setKickDialog({ open })}
          bidder={kickDialog.bidder}
          productId={productId}
          onSuccess={handleKickSuccess}
        />
      </CardContent>
    </Card>
  );
}
