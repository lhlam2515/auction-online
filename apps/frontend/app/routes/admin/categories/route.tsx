import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Categories - Online Auction" },
    {
      name: "description",
      content: "Manage Categories page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageCategoriesPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Categories</h1>
      <p>Content for Manage Categories goes here.</p>
    </div>
  );
}
