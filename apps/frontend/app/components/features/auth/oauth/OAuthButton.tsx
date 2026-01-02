import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { buildApiUrl } from "@/lib/url";

interface OAuthButtonProps {
  provider: "google" | "facebook";
  disabled?: boolean;
}

const OAuthButton = ({ provider, disabled }: OAuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = async () => {
    setIsLoading(true);

    try {
      const result = await api.auth.signInWithOAuth({
        provider,
        redirectTo: buildApiUrl("/auth/oauth/callback"),
      });

      if (!result.success) {
        throw new Error(
          result.error?.message || "Đăng nhập bằng OAuth thất bại"
        );
      }

      // Redirect to the OAuth provider's consent page
      window.location.href = result.data.redirectUrl;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
      );
      setIsLoading(false);
    }
  };

  const providerConfig = {
    google: {
      provider: "Google",
      label: "Tiếp tục với Google",
      icon: (
        <img
          src="/icons/google.svg"
          alt="Google"
          className="h-5 w-5"
          width={20}
          height={20}
        />
      ),
    },
    facebook: {
      provider: "Facebook",
      label: "Tiếp tục với Facebook",
      icon: (
        <img
          src="/icons/facebook.svg"
          alt="Facebook"
          className="h-5 w-5"
          width={20}
          height={20}
        />
      ),
    },
  };

  const config = providerConfig[provider];

  return (
    <Button
      type="button"
      variant="secondary"
      className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 text-xl"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
    >
      {!isLoading && config.icon}
      {isLoading && <Spinner />}
      {isLoading ? `Đang kết nối với ${config.provider}...` : config.label}
    </Button>
  );
};

export default OAuthButton;
