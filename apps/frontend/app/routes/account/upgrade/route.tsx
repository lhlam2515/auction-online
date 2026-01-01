import { Store, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

import UpgradeRequestForm from "@/components/features/bidder/UpgradeRequestForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";
import { upgradeRequestSchema } from "@/lib/validations/user.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nâng Cấp Thành Người Bán - Online Auction" },
    {
      name: "description",
      content:
        "Mở rộng kinh doanh của bạn bằng cách trở thành người bán trên nền tảng đấu giá của chúng tôi. Tận hưởng các công cụ và hỗ trợ chuyên nghiệp để phát triển cửa hàng của bạn.",
    },
  ];
}

export default function UpgradeToSellerPage() {
  const { isSeller, isExpired, expireDate, daysRemaining } = useSellerStatus();

  // Render chưa là seller: form nâng cấp
  if (!isSeller) {
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
                <CardDescription className="text-base">
                  Hoàn thành form dưới đây để gửi yêu cầu nâng cấp
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-300 bg-blue-50 text-blue-600">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-semibold">
                Sẵn Sàng Trở Thành Người Bán?
              </AlertTitle>
              <AlertDescription className="text-blue-600">
                Nâng cấp tài khoản của bạn để bắt đầu bán hàng trên nền tảng đấu
                giá của chúng tôi. Quá trình này rất đơn giản và nhanh chóng!
              </AlertDescription>
            </Alert>

            <UpgradeRequestForm
              schema={upgradeRequestSchema}
              defaultValues={{
                reason: "",
                agreedToTerms: false,
              }}
              onSubmit={api.users.requestSellerUpgrade}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render seller hết hạn
  if (isExpired) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Store className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Gia Hạn Quyền Bán Hàng
                </CardTitle>
                <CardDescription className="text-base">
                  Hết hạn vào{" "}
                  <span className="font-semibold">
                    {formatDate(expireDate!)}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-300 bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="font-semibold">
                Quyền Bán Hàng Đã Hết Hạn
              </AlertTitle>
              <AlertDescription className="text-amber-600">
                Vui lòng gia hạn quyền bán hàng để có thể đăng sản phẩm mới. Các
                sản phẩm đã bắt đầu đấu giá sẽ tiếp tục bình thường.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 rounded-lg border border-amber-300 bg-white p-4">
              <h4 className="mb-2 font-semibold text-neutral-900">
                Trạng Thái Của Bạn:
              </h4>
              <ul className="text-card-foreground space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-green-600" />
                  <span>
                    Sản phẩm đã bắt đầu đấu giá sẽ tiếp tục hoạt động bình
                    thường
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
                  <span>Không thể đăng sản phẩm mới cho đến khi gia hạn</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-600" />
                  <span>Vẫn có thể quản lý sản phẩm hiện có</span>
                </li>
              </ul>
            </div>

            <UpgradeRequestForm
              schema={upgradeRequestSchema}
              defaultValues={{
                reason: "",
                agreedToTerms: false,
              }}
              onSubmit={api.users.requestSellerUpgrade}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render seller hoạt động bình thường
  return (
    <Card className="border-emerald-300 bg-emerald-50">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl text-emerald-900">
              Bạn Đã Là Người Bán
            </CardTitle>
            <CardDescription className="text-base text-emerald-800">
              {daysRemaining === null
                ? "Tài khoản của bạn có quyền bán hàng vô hạn"
                : `Hết hạn vào ${formatDate(expireDate!)} (${daysRemaining} ngày còn lại)`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-card-foreground">
          Chúc mừng! Bạn giờ có thể bán hàng trên nền tảng đấu giá của chúng
          tôi.
        </p>
        <div className="space-y-2 rounded-lg border border-emerald-300 bg-white p-4">
          <h4 className="text-card-foreground font-semibold">
            Các Tính Năng Bạn Có Thể Sử Dụng:
          </h4>
          <ul className="text-card-foreground space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Đăng và quản lý sản phẩm đấu giá
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Xem lịch sử giao dịch và doanh thu
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Nhận thông báo từ những người mua
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Xây dựng danh tiếng bán hàng của bạn
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
