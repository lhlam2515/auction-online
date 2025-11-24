import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Online Auction" },
    { name: "description", content: "Login page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function LoginComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <p>Content for Login goes here.</p>
    </div>
  );
}
