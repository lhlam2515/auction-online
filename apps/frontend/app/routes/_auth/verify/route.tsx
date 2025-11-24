import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify OTP - Online Auction" },
    { name: "description", content: "Verify OTP page for Online Auction App" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function VerifyOTPComponent() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Verify OTP</h1>
      <p>Content for Verify OTP goes here.</p>
    </div>
  );
}
