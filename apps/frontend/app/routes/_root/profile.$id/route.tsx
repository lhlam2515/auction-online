import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search & Browse - Online Auction" },
    {
      name: "description",
      content: "Search & Browse page for Online Auction App",
    },
  ];
}

export default function PublicProfile() {}
