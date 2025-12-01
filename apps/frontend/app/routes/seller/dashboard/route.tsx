import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Seller Dashboard - Online Auction" },
    {
      name: "description",
      content: "Seller Dashboard page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function SellerDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Seller Dashboard</h1>
      <p>Content for Seller Dashboard goes here.</p>
    </div>
  );
}
