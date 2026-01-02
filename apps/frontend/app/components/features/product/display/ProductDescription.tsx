import type { UpdateDescriptionResponse } from "@repo/shared-types";
import { ChevronDown, ChevronUp, Info, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { formatDate } from "@/lib/utils";

interface ProductDescriptionProps {
  productId: string;
  initialDescription: string;
  className?: string;
}

const ProductDescription = ({
  productId,
  initialDescription,
  className,
}: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState<UpdateDescriptionResponse[]>(
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchDescriptionUpdates = async () => {
      if (!isMounted) return;

      try {
        const result = await api.products.getDescriptionUpdates(productId);

        if (!result.success) {
          throw new Error(
            result.error?.message || "Không thể tải cập nhật mô tả"
          );
        }

        if (isMounted && result.data) {
          setUpdatedDesc(result.data);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(
            error,
            "Có lỗi khi tải cập nhật mô tả"
          );
          showError(error, errorMessage);
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
            className="ProseMirror prose prose-slate dark:prose-invert max-w-none"
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
                  className="ProseMirror prose prose-slate dark:prose-invert max-w-none"
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
};

export default ProductDescription;
