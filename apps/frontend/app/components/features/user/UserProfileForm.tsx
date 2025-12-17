import type { User } from "@repo/shared-types";
import { AxiosError, isAxiosError } from "axios";
import { Lock, Store, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

// TODO: Define props based on SRS requirements
// type UserProfileFormProps = {
//   className?: string;
//   [key: string]: any;
// };

/**
 * Component: UserProfileForm
 * Generated automatically based on Project Auction SRS.
 */

const UserProfileForm = () => {
  //(props: UserProfileFormProps) => {
  const [userData, setUserData] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.users.getProfile();
        if (data?.success && data.data) {
          setUserData(data.data);
          setFullname(data.data.fullName);
          setEmail(data.data.email);
          setAddress(data.data.address || "");
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const data = await api.users.updateProfile({
        fullName: fullname,
        email: email,
        avatarUrl: "",
        address: address,
      });
      if (data?.success) {
        toast.success(SUCCESS_MESSAGES.UPDATE_PROFILE);
      } else {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
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
    <>
      <Card className="grid grid-cols-2">
        <CardContent className="space-y-6">
          {/* Personal Info Form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Họ và Tên</Label>
              <Input
                id="fullname"
                defaultValue={userData?.fullName}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={userData?.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Địa Chỉ</Label>
              <Textarea
                id="address"
                defaultValue={userData?.address || ""}
                rows={3}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="bg-slate-900 text-white hover:bg-slate-500"
            type="button"
            onClick={handleSave}
          >
            Lưu Thay Đổi
          </Button>
        </CardContent>
        <CardHeader>
          {/* <div className="flex items-center gap-2"> */}

          {/* //</div> */}
          <div className="flex flex-col items-center gap-2">
            <CardTitle className="text-2xl">Thông Tin Cá Nhân</CardTitle>
            <CardDescription className="text-xl">
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-35 w-35">
              <AvatarImage src="" />
              <AvatarFallback className="bg-slate-900 text-xl text-white">
                NA
              </AvatarFallback>
            </Avatar>

            <Button
              className="bg-slate-900 text-white hover:bg-slate-500"
              variant="outline"
              size="sm"
            >
              <Camera className="mr-2 h-4 w-4" />
              Thay Đổi Ảnh
            </Button>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};

export default UserProfileForm;
