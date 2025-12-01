import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reset Password - Online Auction" },
    {
      name: "description",
      content: "Reset Password page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ResetPasswordPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>
      <p>Content for Reset Password goes here.</p>
    </div>
  );
}
