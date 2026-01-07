import { FolderTree } from "lucide-react";

import { CategoryTreeManager } from "@/components/features/admin/categories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản Lý Danh Mục - Online Auction" },
    {
      name: "description",
      content: "Trang quản lý danh mục cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function ManageCategoriesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FolderTree className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quản lý danh mục</CardTitle>
              <CardDescription className="text-lg">
                Xem và quản lý cây danh mục sản phẩm
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CategoryTreeManager />
        </CardContent>
      </Card>
    </div>
  );
}
