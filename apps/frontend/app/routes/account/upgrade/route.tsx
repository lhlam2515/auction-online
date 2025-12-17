import { useCallback } from "react";
import type z from "zod";

import UpgradeRequestForm from "@/components/features/bidder/UpgradeRequestForm";
import { api } from "@/lib/api-layer";
import { upgradeRequestSchema } from "@/lib/validations/user.validation";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upgrade to Seller - Online Auction" },
    {
      name: "description",
      content: "Upgrade to Seller page for Online Auction App",
    },
  ];
}

export default function UpgradetoSellerPage() {
  const handleSubmit = useCallback(
    async (data: z.infer<typeof upgradeRequestSchema>) => {
      const result = await api.users.requestSellerUpgrade({
        reason: data.reason,
      });
      console.log(result);
      return result;
    },
    []
  );
  return (
    <UpgradeRequestForm
      schema={upgradeRequestSchema}
      defaultValues={{
        reason: "",
        agreedToTerms: true,
      }}
      onSubmit={handleSubmit}
    />
  );
}
