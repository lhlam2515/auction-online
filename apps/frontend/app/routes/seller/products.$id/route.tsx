import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Auction - Online Auction" },
    {
      name: "description",
      content: "Manage Auction page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageAuctionComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Auction</h1>
      <p>Content for Manage Auction goes here.</p>
    </div>
  );
}
