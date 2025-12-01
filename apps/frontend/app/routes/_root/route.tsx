import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home Page - Online Auction" },
    { name: "description", content: "Home Page page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Home Page</h1>
      <p>Content for Home Page goes here.</p>
    </div>
  );
}
