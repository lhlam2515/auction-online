import { ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTH_PAGE_CONFIG } from "@/constants";
import { AUTH_ROUTES } from "@/constants/routes";

export default function AuthLayout() {
  const pathname = window.location.pathname;
  const pageConfig = AUTH_PAGE_CONFIG[pathname];

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full justify-center max-md:min-h-screen md:max-w-xl">
        <CardHeader className="flex flex-col-reverse items-center justify-end gap-4 md:flex-row-reverse">
          <div className="w-full max-md:text-center">
            <CardTitle className="text-3xl">{pageConfig.title}</CardTitle>
            <CardDescription className="text-xl">
              {pageConfig.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Outlet />
        </CardContent>

        <CardFooter className="flex-col gap-4">
          {pathname === "/login" && (
            <p>
              Chưa có tài khoản?{" "}
              <Link
                to={AUTH_ROUTES.REGISTER}
                className="text-primary underline underline-offset-2"
              >
                Đăng ký
              </Link>
            </p>
          )}
          {pathname === "/register" && (
            <p>
              Đã có tài khoản?{" "}
              <Link
                to={AUTH_ROUTES.LOGIN}
                className="text-primary underline underline-offset-2"
              >
                Đăng nhập
              </Link>
            </p>
          )}
          {["/forgot-password", "/reset-password", "/verify"].includes(
            pathname
          ) && (
            <Link
              to={AUTH_ROUTES.LOGIN}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft />{" "}
              <span className="text-primary underline underline-offset-2">
                Quay lại đăng nhập
              </span>
            </Link>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
