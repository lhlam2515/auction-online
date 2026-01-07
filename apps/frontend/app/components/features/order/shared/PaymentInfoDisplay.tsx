import type { OrderPayment } from "@repo/shared-types";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";

const PaymentInfoDisplay = ({ payment }: { payment: OrderPayment }) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Thông tin thanh toán</Label>

      <div className="grid gap-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground text-sm">Phương thức</span>
          <span className="text-card-foreground font-medium">
            {payment.method === "BANK_TRANSFER"
              ? "Chuyển khoản ngân hàng"
              : payment.method === "CREDIT_CARD"
                ? "Thẻ tín dụng"
                : payment.method === "EWALLET"
                  ? "Ví điện tử"
                  : "Phương thức khác"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground text-sm">Số tiền</span>
          <span className="text-card-foreground font-medium">
            {formatPrice(parseFloat(payment.amount))}
          </span>
        </div>

        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground text-sm">Trạng thái</span>
          <Badge
            variant="outline"
            className={cn("px-2 py-0.5 text-xs font-semibold", {
              "border-amber-500/20 bg-amber-500/10 text-amber-600":
                payment.status === "PENDING",
              "border-emerald-500/20 bg-emerald-500/10 text-emerald-600":
                payment.status === "SUCCESS",
              "bg-destructive/10 border-destructive/20 text-destructive":
                payment.status === "FAILED",
            })}
          >
            {payment.status === "SUCCESS"
              ? "Đã thanh toán"
              : payment.status === "FAILED"
                ? "Thanh toán thất bại"
                : "Chờ xử lý"}
          </Badge>
        </div>

        {payment.transactionRef && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Mã giao dịch</span>
            <span className="text-card-foreground font-mono text-sm font-medium">
              {payment.transactionRef}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoDisplay;
