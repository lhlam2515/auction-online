import { FileQuestion, Home, Search } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Không Tìm Thấy Trang - Online Auction" },
    {
      name: "description",
      content: "Trang bạn đang tìm kiếm không tồn tại",
    },
  ];
}

export default function NotFoundPage() {
  return (
    <div className="py-10">
      <Card className="min-w-xl">
        <CardHeader className="text-center">
          <div className="bg-muted text-muted-foreground mx-auto flex size-16 items-center justify-center rounded-full">
            <FileQuestion className="size-8" />
          </div>
          <CardTitle className="text-2xl">Không Tìm Thấy Trang</CardTitle>
          <CardDescription>
            <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <p>Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.</p>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row justify-center gap-3">
          <Button asChild variant="default">
            <Link to={APP_ROUTES.HOME}>
              <Home className="mr-1 h-4 w-4" />
              Về Trang Chủ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={APP_ROUTES.SEARCH}>
              <Search className="mr-1 h-4 w-4" />
              Tìm Kiếm
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
