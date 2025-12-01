import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sold Orders - Online Auction" },
    { name: "description", content: "Sold Orders page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function SoldOrdersPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Sold Orders</h1>
      <p>Content for Sold Orders goes here.</p>
    </div>
  );
}
