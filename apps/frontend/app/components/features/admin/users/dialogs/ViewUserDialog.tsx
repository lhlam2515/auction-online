import { User, Mail, Calendar, MapPin, Shield, Star } from "lucide-react";
import { useState } from "react";

import { UserAvatar } from "@/components/common";
import { RoleBadge, AccountStatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

import { useUserDetails } from "../hooks";

type ViewUserDialogProps = {
  userId: string;
  trigger?: React.ReactNode;
};

const ViewUserDialog = ({ userId, trigger }: ViewUserDialogProps) => {
  const [open, setOpen] = useState(false);

  const { user, loading, error } = useUserDetails({
    userId,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Xem chi tiết</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin người dùng
          </DialogTitle>
          <DialogDescription>
            Chi tiết đầy đủ về tài khoản người dùng
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                Đang tải thông tin...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <UserAvatar
                name={user.fullName}
                imageUrl={user.avatarUrl}
                className="h-20 w-20"
                fallbackClassName="text-xl"
              />
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-muted-foreground text-sm">
                  @{user.username}
                </p>
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role={user.role} />
                  <AccountStatusBadge status={user.accountStatus} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold">
                <Mail className="h-4 w-4" />
                Thông tin liên hệ
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold">
                <Shield className="h-4 w-4" />
                Thông tin tài khoản
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Ngày sinh</p>
                  <p className="text-sm">
                    {user.birthDate
                      ? formatDate(new Date(user.birthDate), true)
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Ngày tạo</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <p className="text-sm">
                      {formatDate(new Date(user.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rating Information */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold">
                <Star className="h-4 w-4" />
                Đánh giá
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">
                    {(user.ratingScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>
                    Từ <span className="font-medium">{user.ratingCount}</span>{" "}
                    đánh giá
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {user.role === "SELLER" && user.sellerExpireDate && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <Shield className="h-4 w-4" />
                    Thông tin Seller
                  </h4>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">
                      Ngày hết hạn
                    </p>
                    <p className="text-sm">
                      {formatDate(new Date(user.sellerExpireDate))}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;
