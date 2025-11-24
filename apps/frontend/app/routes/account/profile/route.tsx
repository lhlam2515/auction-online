import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Profile - Online Auction" },
    {
      name: "description",
      content: "User Profile page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function UserProfileComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
      <p>Content for User Profile goes here.</p>
    </div>
  );
}
