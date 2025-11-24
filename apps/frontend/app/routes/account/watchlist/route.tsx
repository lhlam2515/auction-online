import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Watch List - Online Auction" },
    { name: "description", content: "Watch List page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function WatchListComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Watch List</h1>
      <p>Content for Watch List goes here.</p>
    </div>
  );
}
