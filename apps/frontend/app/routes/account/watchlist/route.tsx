import { Heart, UserIcon } from "lucide-react";

import WatchList from "@/components/features/bidder/WatchList";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  Card,
} from "@/components/ui/card";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Watch List - Online Auction" },
    { name: "description", content: "Watch List page for Online Auction App" },
  ];
}

export default function WatchListPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Heart className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Danh sách yêu thích</CardTitle>
            <CardDescription className="text-lg">
              Theo dõi các sản phẩm yêu thích
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <WatchList />
    </Card>
  );
}
