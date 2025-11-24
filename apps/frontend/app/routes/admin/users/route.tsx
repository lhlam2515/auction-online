import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Users - Online Auction" },
    {
      name: "description",
      content: "Manage Users page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageUsersComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Users</h1>
      <p>Content for Manage Users goes here.</p>
    </div>
  );
}
