import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Order Checkout - Online Auction" },
    {
      name: "description",
      content: "Order Checkout page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function OrderCheckoutPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Order Checkout</h1>
      <p>Content for Order Checkout goes here.</p>
    </div>
  );
}
