import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - Online Auction" },
    { name: "description", content: "Register page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function RegisterComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <p>Content for Register goes here.</p>
    </div>
  );
}
