import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard - Online Auction" },
    {
      name: "description",
      content: "Admin Dashboard page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function AdminDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p>Content for Admin Dashboard goes here.</p>
    </div>
  );
}
