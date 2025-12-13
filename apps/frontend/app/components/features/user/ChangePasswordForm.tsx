import { isAxiosError } from "axios";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

// TODO: Define props based on SRS requirements
type ChangePasswordFormProps = {
  className?: string;
  [key: string]: any;
};

/**
 * Component: ChangePasswordForm
 * Generated automatically based on Project Auction SRS.
 */
const ChangePasswordForm = () => {
  //= (props: ChangePasswordFormProps) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [conPassword, setConPassword] = useState("");

  const handleChange = async () => {
    try {
      const request = await api.users.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });
      if (request?.success && request.data) {
        toast.success(SUCCESS_MESSAGES.CHANGE_PASSWORD);
      } else {
        toast.error(request?.message || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message || error.response?.data?.stack;
        const errorMessage = backendMessage || error.message;

        toast.error(errorMessage);
      } else {
        toast.error("Lỗi không xác định");
      }
    }
  };
  return (
    // <div className={props.className}>
    // {/* Implement logic for ChangePasswordForm here */}
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-900" />
            <CardTitle>Bảo Mật</CardTitle>
          </div>
          <CardDescription>Thay đổi mật khẩu của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="old-password">Mật Khẩu Cũ</Label>
            <Input
              id="old-password"
              type="password"
              placeholder="Nhập mật khẩu cũ"
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">Mật Khẩu Mới</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Nhập mật khẩu mới"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Xác Nhận Mật Khẩu</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              onChange={(e) => setConPassword(e.target.value)}
            />
          </div>

          <Button
            className="bg-slate-900 hover:bg-slate-500"
            onClick={handleChange}
          >
            Đổi Mật Khẩu
          </Button>
        </CardContent>
      </Card>
    </>
    // </div>
  );
};

export default ChangePasswordForm;
