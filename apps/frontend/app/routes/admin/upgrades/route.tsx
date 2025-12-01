import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Approve Upgrades - Online Auction" },
    {
      name: "description",
      content: "Approve Upgrades page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ApproveUpgradesPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Approve Upgrades</h1>
      <p>Content for Approve Upgrades goes here.</p>
    </div>
  );
}
