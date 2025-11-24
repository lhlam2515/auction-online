import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bids - Online Auction" },
    { name: "description", content: "My Bids page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function MyBidsComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">My Bids</h1>
      <p>Content for My Bids goes here.</p>
    </div>
  );
}
