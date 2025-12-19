import WatchList from "@/components/features/bidder/WatchList";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Watch List - Online Auction" },
    { name: "description", content: "Watch List page for Online Auction App" },
  ];
}

export default function WatchListPage() {
  return <WatchList />;
}
