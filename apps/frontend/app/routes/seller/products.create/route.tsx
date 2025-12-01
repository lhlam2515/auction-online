import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Auction - Online Auction" },
    {
      name: "description",
      content: "Create Auction page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function CreateAuctionPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Create Auction</h1>
      <p>Content for Create Auction goes here.</p>
    </div>
  );
}
