import type { UpdateDescriptionResponse } from "@repo/shared-types";
import { ChevronDown, ChevronUp, Info, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";

interface ProductDescriptionProps {
  productId: string;
  initialDescription: string;
  className?: string;
  [key: string]: any;
}

export function ProductDescription({
  productId,
  initialDescription,
  className,
}: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState<UpdateDescriptionResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchDescriptionUpdates = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.products.getDescriptionUpdates(productId);

        if (isMounted) {
          if (response.success && response.data) {
            setUpdatedDesc(response.data);
          } else {
            setError("Không thể tải cập nhật mô tả");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Có lỗi khi tải cập nhật mô tả");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDescriptionUpdates();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <Info className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          Mô tả sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div key={"original"} className="space-y-2">
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: initialDescription }}
          />
        </div>

        {isExpanded &&
          updatedDesc.map((paragraph) => {
            const updateDateTime = new Date(paragraph.createdAt);

            return (
              <div key={paragraph.id} className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Pencil className="h-4 w-4" />
                  <span>Cập nhật lúc {formatDate(updateDateTime)}</span>
                </div>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: paragraph.content }}
                />
              </div>
            );
          })}

        {updatedDesc.length > 0 && (
          <Button
            variant="outline"
            className="w-full cursor-pointer bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Xem thêm
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
