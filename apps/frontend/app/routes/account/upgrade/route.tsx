import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upgrade to Seller - Online Auction" },
    {
      name: "description",
      content: "Upgrade to Seller page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function UpgradetoSellerComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Upgrade to Seller</h1>
      <p>Content for Upgrade to Seller goes here.</p>
    </div>
  );
}
