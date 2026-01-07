import type { RatingWithUsers } from "@repo/shared-types";
import { Package } from "lucide-react";

import { PaginationBar } from "@/components/common";
import { Card } from "@/components/ui/card";
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
    <Card className="h-full border-none bg-transparent shadow-none">
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
          <div className="text-muted-foreground rounded-lg border border-dashed bg-white py-10 text-center">
            <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />
            {filter === "all"
              ? "Chưa có đánh giá nào"
              : `Chưa có đánh giá ${filter === "positive" ? "tích cực" : "tiêu cực"} nào`}
          </div>
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
    </Card>
  );
}
