import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Sold Order - Online Auction" },
    {
      name: "description",
      content: "Manage Sold Order page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageSoldOrderComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Sold Order</h1>
      <p>Content for Manage Sold Order goes here.</p>
    </div>
  );
}
