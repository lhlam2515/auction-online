import { ShieldAlert, Home } from "lucide-react";
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
    { title: "Không Có Quyền Truy Cập - Online Auction" },
    {
      name: "description",
      content: "Bạn không có quyền truy cập vào trang này",
    },
  ];
}

export default function UnauthorizedPage() {
  return (
    <div className="px-auto py-10">
      <Card className="w-xl">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 text-destructive mx-auto flex size-16 items-center justify-center rounded-full">
            <ShieldAlert className="size-8" />
          </div>
          <CardTitle className="text-2xl">Không Có Quyền Truy Cập</CardTitle>
          <CardDescription>
            <p>Bạn không có quyền truy cập vào trang này.</p>
            <p>Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row justify-center">
          <Button asChild className="">
            <Link to={APP_ROUTES.HOME}>
              <Home />
              Về Trang Chủ
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
