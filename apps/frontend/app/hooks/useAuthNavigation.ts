import type { UserAuthData } from "@repo/shared-types";
import { useNavigate, useLocation } from "react-router";

import {
  AUTH_ROUTES,
  getRedirectAfterLogin,
  isAuthRoute,
  isPublicRoute,
} from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";

interface UseAuthNavigationConfig {
  formType: "LOGIN" | "REGISTER";
}

export const useAuthNavigation = ({ formType }: UseAuthNavigationConfig) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const navigateAfterSuccess = (user?: UserAuthData) => {
    if (formType === "LOGIN" && user) {
      const from = location.state?.from?.pathname;

      if (from && isPublicRoute(from) && !isAuthRoute(from)) {
        navigate(from, { replace: true });
        return;
      }

      login(user); // Update the auth context
      navigate(from || getRedirectAfterLogin(user.role), { replace: true });
    } else {
      // REGISTER - navigate to verification
      navigate(AUTH_ROUTES.VERIFY, { replace: true });
    }
  };

  const navigateAfterError = (errorMessage: string) => {
    // Navigate to verification if error message contains "xác minh"
    if (errorMessage.toLocaleLowerCase().includes("xác minh")) {
      setTimeout(() => {
        navigate(AUTH_ROUTES.VERIFY, { replace: true });
      }, 1500);
    }
  };

  return {
    navigateAfterSuccess,
    navigateAfterError,
  };
};
