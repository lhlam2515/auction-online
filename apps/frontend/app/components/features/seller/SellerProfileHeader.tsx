import { Clock } from "lucide-react";

import { ProfileHeader } from "@/components/common";
import { RoleBadge } from "@/components/common/badges";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { cn, formatDate } from "@/lib/utils";

import CreateProductButton from "./CreateProductButton";

interface SellerProfileHeaderProps {
  user: {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    ratingScore: number;
    ratingCount: number;
    sellerExpireDate: Date | string | null;
  };
  className?: string;
}

const SellerProfileHeader = ({ user, className }: SellerProfileHeaderProps) => {
  const {
    isExpired,
    isTemporary,
    shouldShowWarning,
    daysRemaining,
    expireDate,
  } = useSellerStatus();

  const badges = (
    <>
      <RoleBadge role="SELLER" />
      {isTemporary && (
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/20 text-primary gap-1"
        >
          Người bán tạm thời
        </Badge>
      )}
      {isExpired && !isTemporary && (
        <Badge variant="destructive" className="gap-1">
          Đã hết hạn
        </Badge>
      )}
      {shouldShowWarning && !isExpired && (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-600"
        >
          Sắp hết hạn
        </Badge>
      )}
    </>
  );

  const rightContent = (
    <>
      <CreateProductButton
        className="shadow-primary/20 w-full shadow-lg transition-all hover:scale-[1.02]"
        size="default"
      />

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" /> Hiệu lực
          </span>
          <span
            className={cn(
              "font-medium",
              isExpired
                ? "text-destructive"
                : shouldShowWarning
                  ? "text-amber-600"
                  : "text-emerald-600"
            )}
          >
            {isExpired
              ? "Đã hết hạn"
              : daysRemaining !== null
                ? `Còn ${daysRemaining} ngày`
                : "Vĩnh viễn"}
          </span>
        </div>
        {expireDate && (
          <>
            <Separator />
            <div className="text-muted-foreground text-right text-xs">
              Hết hạn: {formatDate(expireDate)}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <ProfileHeader
      user={user}
      badges={badges}
      rightContent={rightContent}
      className={className}
    />
  );
};

export default SellerProfileHeader;
