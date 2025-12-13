import { User, Lock, Store, Camera } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// TODO: Define props based on SRS requirements
// type UpgradeRequestFormProps = {
//   className?: string;
//   [key: string]: any;
// };

/**
 * Component: UpgradeRequestForm
 * Generated automatically based on Project Auction SRS.
 */
const UpgradeRequestForm = () => {
  //(props: UpgradeRequestFormProps) => {
  const [sellerRequestStatus, setSellerRequestStatus] = useState<
    "none" | "pending"
  >("none");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSellerRequest = () => {
    setSellerRequestStatus("pending");
  };
  return (
    <>
      <Card className="border-2 border-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-slate-900" />
              <CardTitle>Nâng Cấp Thành Người Bán</CardTitle>
            </div>
            {sellerRequestStatus === "pending" && (
              <Badge
                variant="secondary"
                className="border-amber-200 bg-amber-100 text-amber-800"
              >
                Đang Chờ Duyệt
              </Badge>
            )}
          </div>
          <CardDescription>
            Yêu cầu quyền bán hàng trên nền tảng đấu giá
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sellerRequestStatus === "none" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="seller-reason">
                  Tại sao bạn muốn trở thành người bán?
                </Label>
                <Textarea
                  id="seller-reason"
                  placeholder="Chia sẻ lý do và kinh nghiệm của bạn..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-slate-500">
                  Vui lòng mô tả chi tiết về mặt hàng bạn muốn bán và kinh
                  nghiệm kinh doanh (nếu có)
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="cursor-pointer text-sm leading-relaxed font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tôi đồng ý với{" "}
                    <a
                      href="#"
                      className="text-slate-900 underline hover:text-slate-700"
                    >
                      Điều khoản & Chính sách Người Bán
                    </a>
                  </label>
                  <p className="text-sm text-slate-500">
                    Bạn cam kết tuân thủ các quy định về bán hàng và đấu giá
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-slate-900 hover:bg-slate-800"
                disabled={!agreeToTerms}
                onClick={handleSellerRequest}
              >
                <Store className="mr-2 h-4 w-4" />
                Gửi Yêu Cầu
              </Button>
            </>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Store className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-amber-900">
                    Yêu Cầu Đang Được Xử Lý
                  </h4>
                  <p className="text-sm leading-relaxed text-amber-800">
                    Yêu cầu nâng cấp thành người bán của bạn đang được quản trị
                    viên xem xét. Chúng tôi sẽ phản hồi trong vòng 2-3 ngày làm
                    việc qua email.
                  </p>
                  <p className="mt-2 text-xs text-amber-700">
                    Ngày gửi yêu cầu: {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default UpgradeRequestForm;
