import { Settings } from "lucide-react";

import { AuctionSettingsManager } from "@/components/features/admin/settings";
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
    { title: "Cài Đặt Hệ Thống - Online Auction" },
    {
      name: "description",
      content: "Trang cài đặt hệ thống cho Online Auction",
    },
  ];
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Settings className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Cài đặt hệ thống</CardTitle>
              <CardDescription className="text-lg">
                Quản lý các thiết lập cấu hình đấu giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AuctionSettingsManager />
        </CardContent>
      </Card>
    </div>
  );
}
