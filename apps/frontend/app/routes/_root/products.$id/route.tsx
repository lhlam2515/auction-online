import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Detail - Online Auction" },
    {
      name: "description",
      content: "Product Detail page for Online Auction App",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ProductDetailPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Product Detail</h1>
      <p>Content for Product Detail goes here.</p>
    </div>
  );
}
