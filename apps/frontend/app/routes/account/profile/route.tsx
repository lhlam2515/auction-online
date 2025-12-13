import { useState } from "react";

import type { Route } from "./+types/route";
import UserProfileForm from "../../../components/features/user/UserProfileForm";

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
  const [sellerRequestStatus, setSellerRequestStatus] = useState<
    "none" | "pending"
  >("none");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSellerRequest = () => {
    setSellerRequestStatus("pending");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Cài Đặt Tài Khoản
          </h1>
          <p className="text-slate-600">
            Quản lý thông tin cá nhân và cài đặt bảo mật
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Personal Info */}
          <UserProfileForm />
          {/* Section 2: Security */}

          {/* Section 3: Upgrade to Seller (UC-B05) */}
        </div>
      </div>
    </div>
  );
}
