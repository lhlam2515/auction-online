import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage All Products - Online Auction" },
    {
      name: "description",
      content: "Manage All Products page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageAllProductsComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage All Products</h1>
      <p>Content for Manage All Products goes here.</p>
    </div>
  );
}
