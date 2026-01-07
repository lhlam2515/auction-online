import { Store, CheckCircle, AlertTriangle } from "lucide-react";

import { AlertSection } from "@/components/common/feedback";
import { UpgradeRequestForm } from "@/components/features/user/forms";
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
            <AlertSection
              variant="info"
              title="Lợi Ích Khi Trở Thành Người Bán"
              description={
                <span>
                  Bằng cách trở thành người bán, bạn sẽ có thể đăng và quản lý
                  sản phẩm đấu giá, tiếp cận với hàng ngàn người mua tiềm năng,
                  và tận hưởng các công cụ hỗ trợ bán hàng chuyên nghiệp.
                </span>
              }
            />
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

  // Render seller đã hết hạn: form gia hạn
  if (isExpired) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Store className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Gia Hạn Quyền Bán Hàng
                </CardTitle>
                <CardDescription className="text-base">
                  Hết hạn vào{" "}
                  <span className="font-semibold">
                    {expireDate ? formatDate(expireDate) : "Không xác định"}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertSection
              variant="warning"
              icon={AlertTriangle}
              title="Quyền Bán Hàng Đã Hết Hạn"
              description={
                <span>
                  Tài khoản người bán của bạn đã hết hạn vào ngày{" "}
                  {expireDate ? formatDate(expireDate) : "không xác định"}. Bạn
                  cần gia hạn để tiếp tục đăng sản phẩm mới.
                </span>
              }
            />
            <AlertSection
              variant="info"
              title="Trạng Thái Tài Khoản Người Bán Của Bạn"
              description={
                <span>
                  Mặc dù quyền bán hàng của bạn đã hết hạn, bạn vẫn có thể quản
                  lý các sản phẩm hiện có. Tuy nhiên, bạn sẽ không thể đăng sản
                  phẩm mới cho đến khi gia hạn.
                </span>
              }
            />
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
    <Card className="border border-emerald-500/20 bg-emerald-500/10">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl text-emerald-600">
              Bạn Đã Là Người Bán
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {daysRemaining === null
                ? "Tài khoản của bạn có quyền bán hàng vô hạn"
                : `Hết hạn vào ${formatDate(expireDate!)} (${daysRemaining} ngày còn lại)`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlertSection
          variant="success"
          title="Chúc Mừng! Bạn Đã Có Thể Bán Hàng Trên Nền Tảng Của Chúng Tôi"
          description={
            <span>
              Cảm ơn bạn đã trở thành người bán trên nền tảng đấu giá của chúng
              tôi. Hãy bắt đầu đăng sản phẩm và phát triển cửa hàng của bạn ngay
              hôm nay!
            </span>
          }
        />
      </CardContent>
    </Card>
  );
}
