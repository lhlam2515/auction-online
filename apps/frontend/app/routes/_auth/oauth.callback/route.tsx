import {
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { AppEmptyState } from "@/components/common";
import { AUTH_ROUTES, getRedirectAfterLogin } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đang xác thực - Online Auction" },
    { name: "robots", content: "noindex" },
  ];
}

type AuthStep =
  | "validating"
  | "fetching"
  | "authenticating"
  | "success"
  | "error";

interface AuthStepConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AUTH_STEPS: Record<AuthStep, AuthStepConfig> = {
  validating: {
    icon: <KeyRound className="text-primary animate-pulse" />,
    title: "Đang xác thực token",
    description: "Vui lòng đợi trong giây lát...",
  },
  fetching: {
    icon: <UserCircle2 className="text-primary animate-spin" />,
    title: "Đang tải thông tin người dùng",
    description: "Đang lấy dữ liệu tài khoản của bạn...",
  },
  authenticating: {
    icon: <ShieldCheck className="text-primary animate-bounce" />,
    title: "Đang hoàn tất xác thực",
    description: "Gần hoàn tất rồi...",
  },
  success: {
    icon: <CheckCircle2 className="text-green-500" />,
    title: "Đăng nhập thành công!",
    description: "Đang chuyển hướng...",
  },
  error: {
    icon: <Loader2 className="text-destructive" />,
    title: "Đã xảy ra lỗi",
    description: "Không thể xác thực. Đang chuyển về trang đăng nhập...",
  },
};

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState<AuthStep>("validating");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Step 1: Validate token
        setCurrentStep("validating");
        await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth transition

        const token = searchParams.get("token");

        if (!token) {
          throw new Error("Không tìm thấy token xác thực.");
        }

        // Step 2: Fetch user data
        setCurrentStep("fetching");
        const { tokenManager } = await import("@/lib/handlers/token-manager");
        tokenManager.setToken(token);

        const result = await api.auth.me();

        if (!result.success || !result.data?.user) {
          throw new Error("Không thể lấy dữ liệu người dùng.");
        }

        // Step 3: Authenticate
        setCurrentStep("authenticating");
        await new Promise((resolve) => setTimeout(resolve, 500)); // Smooth transition

        login(result.data.user, token);

        // Clean up URL (remove token from query string)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Step 4: Success
        setCurrentStep("success");
        toast.success("Đăng nhập thành công!");

        logger.info("OAuth login successful", {
          userId: result.data.user.id,
        });

        // Redirect after showing success message
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const redirectUrl = getRedirectAfterLogin(result.data.user.role);
        navigate(redirectUrl, { replace: true });
      } catch (error) {
        setCurrentStep("error");
        logger.error("OAuth callback error:", error);
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");

        // Redirect to login after showing error
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate(AUTH_ROUTES.LOGIN, { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  const stepConfig = AUTH_STEPS[currentStep];

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AppEmptyState
          icon={stepConfig.icon}
          title={stepConfig.title}
          description={stepConfig.description}
          className="animate-in fade-in-50 slide-in-from-bottom-4 border-border duration-700"
        />

        {/* Progress indicator */}
        {currentStep !== "error" && currentStep !== "success" && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-center gap-2">
              {(["validating", "fetching", "authenticating"] as AuthStep[]).map(
                (step) => (
                  <div
                    key={step}
                    className={`h-1.5 w-16 rounded-full transition-all duration-500 ${
                      step === currentStep
                        ? "bg-primary scale-110"
                        : (
                              [
                                "validating",
                                "fetching",
                                "authenticating",
                              ] as AuthStep[]
                            ).indexOf(step) <
                            (
                              [
                                "validating",
                                "fetching",
                                "authenticating",
                              ] as AuthStep[]
                            ).indexOf(currentStep)
                          ? "bg-primary"
                          : "bg-muted"
                    }`}
                  />
                )
              )}
            </div>
            <p className="text-muted-foreground text-center text-xs">
              {currentStep === "validating" && "Bước 1/3"}
              {currentStep === "fetching" && "Bước 2/3"}
              {currentStep === "authenticating" && "Bước 3/3"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
