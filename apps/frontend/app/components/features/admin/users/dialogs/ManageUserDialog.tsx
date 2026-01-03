import type { AdminUser } from "@repo/shared-types";
import { UserCog, User, Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { UserAvatar } from "@/components/common";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-layer";

import {
  UpdateUserInfoForm,
  UpdateAccountStatusForm,
  UpdateUserRoleForm,
} from "../forms";

type ManageUserDialogProps = {
  userId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const ManageUserDialog = ({
  userId,
  trigger,
  onSuccess,
}: ManageUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.admin.users.getById(userId);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải thông tin");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, open, userId]);

  const handleSuccess = () => {
    onSuccess?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <UserCog className="h-4 w-4" />
            Quản lý người dùng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Quản lý người dùng
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và trạng thái tài khoản người dùng
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
            {/* User Profile Section */}
            <div className="flex items-start gap-4">
              <UserAvatar
                name={user.fullName}
                imageUrl={user.avatarUrl}
                className="h-16 w-16"
                fallbackClassName="text-lg"
              />
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <p className="text-muted-foreground text-xs">
                  @{user.username}
                </p>
              </div>
            </div>

            <Separator />

            {/* Tabs for Info and Status */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <User className="h-4 w-4" />
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger value="status">
                  <Shield className="h-4 w-4" />
                  Trạng thái tài khoản
                </TabsTrigger>
                <TabsTrigger value="role">
                  <UserCog className="h-4 w-4" />
                  Vai trò
                </TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-4">
                {user && (
                  <UpdateUserInfoForm
                    userId={userId}
                    user={user}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                  />
                )}
              </TabsContent>

              {/* Status Tab */}
              <TabsContent value="status" className="space-y-4">
                {user && (
                  <UpdateAccountStatusForm
                    userId={userId}
                    user={user}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                  />
                )}
              </TabsContent>

              {/* Role Tab */}
              <TabsContent value="role" className="space-y-4">
                {user && (
                  <UpdateUserRoleForm
                    userId={userId}
                    user={user}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ManageUserDialog;
