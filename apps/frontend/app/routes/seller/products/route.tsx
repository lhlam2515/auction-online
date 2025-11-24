import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Seller Products List - Online Auction" },
    {
      name: "description",
      content: "Seller Products List page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function SellerProductsListComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Seller Products List</h1>
      <p>Content for Seller Products List goes here.</p>
    </div>
  );
}
