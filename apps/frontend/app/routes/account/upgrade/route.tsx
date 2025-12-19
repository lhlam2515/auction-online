import { Store } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { z } from "zod";

import UpgradeRequestForm from "@/components/features/bidder/UpgradeRequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import { upgradeRequestSchema } from "@/lib/validations/user.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upgrade to Seller - Online Auction" },
    {
      name: "description",
      content: "Upgrade to Seller page for Online Auction App",
    },
  ];
}

export default function UpgradeToSellerPage() {
  const { user } = useAuth();
  const sellerRequestStatus = useMemo(
    () => user?.role !== "SELLER",
    [user?.role]
  );

  const handleSubmit = useCallback(
    async (data: z.infer<typeof upgradeRequestSchema>) => {
      const result = await api.users.requestSellerUpgrade({
        reason: data.reason,
      });
      return result;
    },
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Store className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Nâng Cấp Thành Người Bán
              </CardTitle>
              <CardDescription className="text-lg">
                Yêu cầu quyền bán hàng trên nền tảng đấu giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sellerRequestStatus ? (
            <UpgradeRequestForm
              schema={upgradeRequestSchema}
              defaultValues={{
                reason: "",
                agreedToTerms: true,
              }}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-600">Bạn đã là người bán</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
