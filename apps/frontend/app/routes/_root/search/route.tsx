import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search & Browse - Online Auction" },
    {
      name: "description",
      content: "Search & Browse page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function SearchBrowsePage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Search & Browse</h1>
      <p>Content for Search & Browse goes here.</p>
    </div>
  );
}
