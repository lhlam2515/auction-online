import { UserCog, User, Shield } from "lucide-react";
import { useState } from "react";

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

import {
  UpdateUserInfoForm,
  UpdateAccountStatusForm,
  UpdateUserRoleForm,
} from "../forms";
import { useUserDetails } from "../hooks";

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
  const [activeTab, setActiveTab] = useState("info");

  const { user, loading, error, refetch } = useUserDetails({
    userId,
    enabled: open,
  });

  const handleSuccess = () => {
    refetch();
    onSuccess?.();
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
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-md bg-gray-50 p-4">
              <UserAvatar
                name={user.fullName}
                imageUrl={user.avatarUrl}
                className="h-16 w-16"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-muted-foreground text-sm">
                  @{user.username}
                </p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            <Separator />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Thông tin</span>
                </TabsTrigger>
                <TabsTrigger value="status" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Trạng thái</span>
                </TabsTrigger>
                <TabsTrigger value="role" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Vai trò</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <UpdateUserInfoForm
                  userId={userId}
                  user={user}
                  onSuccess={handleSuccess}
                  onCancel={() => setOpen(false)}
                />
              </TabsContent>

              <TabsContent value="status" className="mt-4">
                <UpdateAccountStatusForm
                  userId={userId}
                  user={user}
                  onSuccess={handleSuccess}
                  onCancel={() => setOpen(false)}
                />
              </TabsContent>

              <TabsContent value="role" className="mt-4">
                <UpdateUserRoleForm
                  userId={userId}
                  user={user}
                  onSuccess={handleSuccess}
                  onCancel={() => setOpen(false)}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ManageUserDialog;
