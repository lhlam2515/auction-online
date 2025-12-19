import { Star, Plus, ShieldCheck, Clock } from "lucide-react";
import { Link } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { SELLER_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface SellerProfileSectionProps {
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

const SellerProfileSection = ({
  user,
  className,
}: SellerProfileSectionProps) => {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Vĩnh viễn";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate: Date | string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry(user.sellerExpireDate);

  return (
    <Card
      className={cn(
        "overflow-hidden border-none bg-linear-to-r from-slate-50 to-white shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-26 w-26 border-4 border-white shadow-sm">
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.fullName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {user.fullName}
                </h3>
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700"
                >
                  <ShieldCheck className="h-3 w-3" /> Seller
                </Badge>
              </div>

              <p className="font-medium text-slate-500">@{user.username}</p>

              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-900">
                    {(user.ratingScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-slate-400">
                    ({user.ratingCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex flex-col items-end gap-4 md:min-w-[250px] md:border-l md:pl-6">
            <Button
              className="shadow-primary/20 w-full shadow-lg transition-all hover:scale-[1.02]"
              asChild
            >
              <Link to={SELLER_ROUTES.PRODUCT_CREATE}>
                <Plus className="mr-2 h-4 w-4" /> Đăng sản phẩm mới
              </Link>
            </Button>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4" /> Hiệu lực
                </span>
                <span
                  className={cn(
                    "font-medium",
                    daysLeft && daysLeft <= 7
                      ? "text-red-600"
                      : "text-slate-700"
                  )}
                >
                  {daysLeft ? `Còn ${daysLeft} ngày` : "Vĩnh viễn"}
                </span>
              </div>
              <Separator />
              <div className="text-right text-xs text-slate-400">
                Hết hạn: {formatDate(user.sellerExpireDate)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerProfileSection;
