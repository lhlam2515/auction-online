import type { RatingWithUsers } from "@repo/shared-types";
import { Star, XCircle } from "lucide-react";

import { AppEmptyState, PaginationBar } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RatingCard } from "./";

interface RatingHistoryPanelProps {
  ratings: RatingWithUsers[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

export default function RatingHistoryPanel({
  ratings,
  total,
  currentPage,
  totalPages,
  onPageChange,
  filter,
  onFilterChange,
}: RatingHistoryPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">
          Lịch sử đánh giá ({total || ratings.length})
        </h2>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Lọc theo đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đánh giá</SelectItem>
              <SelectItem value="positive">Tích cực</SelectItem>
              <SelectItem value="negative">Tiêu cực</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <RatingCard key={rating.id} rating={rating} />
          ))
        ) : (
          <AppEmptyState
            icon={<Star />}
            title={
              filter === "all"
                ? "Chưa có đánh giá nào"
                : "Không tìm thấy đánh giá"
            }
            description={
              filter === "all"
                ? "Người dùng này chưa nhận được bất kỳ đánh giá nào."
                : `Không có đánh giá ${filter === "positive" ? "tích cực" : "tiêu cực"} nào phù hợp.`
            }
            action={
              filter !== "all" && (
                <Button
                  onClick={() => onFilterChange("all")}
                  className="cursor-pointer"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )
            }
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-2">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
