import type {
  ProductDetails,
  UpdateDescriptionRequest,
} from "@repo/shared-types";
import { Edit } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { ProductDescription } from "@/components/features/product/ProductDescription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RichTextEditor,
  type RichTextEditorRef,
} from "@/components/ui/rich-text-editor";
import { APP_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Auction - Online Auction" },
    {
      name: "description",
      content: "Manage Auction page for Online Auction App",
    },
  ];
}

export default function ManageAuctionPage({ params }: Route.ComponentProps) {
  const { id: productId } = params;
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [descriptionKey, setDescriptionKey] = useState(0); // Key to force ProductDescription re-render
  const editorRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.products.getById(productId);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          toast.error("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        toast.error("Có lỗi khi tải thông tin sản phẩm");
        logger.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateDescription = async () => {
    if (!editorRef.current) return;

    const content = editorRef.current.getContent();
    if (!content.trim() || content === "<p></p>") {
      toast.error("Vui lòng nhập nội dung mô tả");
      return;
    }

    try {
      setUpdating(true);
      const data: UpdateDescriptionRequest = { content };
      const response = await api.products.updateDescription(productId, data);

      if (response.success) {
        toast.success("Đã cập nhật mô tả thành công");
        // Clear the editor
        editorRef.current.setContent("");
        // Force ProductDescription to re-render by changing key
        setDescriptionKey((prev) => prev + 1);
      } else {
        toast.error("Không thể cập nhật mô tả");
      }
    } catch (error) {
      toast.error("Có lỗi khi cập nhật mô tả");
      logger.error("Error updating description:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</p>
          <p className="text-muted-foreground">
            Sản phẩm không tồn tại hoặc đã bị xóa
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Edit className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Cập nhật mô tả</CardTitle>
            <CardDescription className="text-lg">
              <Link
                to={APP_ROUTES.PRODUCT(productId)}
                target="_blank"
                className="hover:underline"
              >
                {product.name}
              </Link>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Product Description Display */}
        <ProductDescription
          key={descriptionKey}
          productId={productId}
          initialDescription={product.description}
        />

        {/* Add Description Form */}
        <div className="space-y-4">
          <p className="text-lg font-semibold">Cập nhật mô tả</p>
          <RichTextEditor
            ref={editorRef}
            placeholder="Nhập mô tả bổ sung cho sản phẩm..."
            className="min-h-[200px]"
            disabled={updating}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => editorRef.current?.setContent("")}
              disabled={updating}
              className="cursor-pointer"
            >
              Xóa
            </Button>
            <Button
              onClick={handleUpdateDescription}
              disabled={updating}
              className={!updating ? "cursor-pointer" : ""}
            >
              {updating ? "Đang cập nhật..." : "Cập nhật mô tả"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
