import { useCallback, useState } from "react";
import type z from "zod";

import { api } from "@/lib/api-layer";
import type { loginSchema } from "@/lib/validations/auth.validation";
import { changePassword } from "@/lib/validations/user.validation";

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

export default function UserProfilePage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
      <p>Content for User Profile goes here.</p>
    </div>
  );
}
