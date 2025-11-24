import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";

import logger, {
  createLogger,
  logPageView,
  type LogContext,
} from "@/lib/logger";

/**
 * Hook để tự động log page views và tạo logger với context
 */
export function useLogger(context?: string | LogContext) {
  const location = useLocation();

  // Tạo logger với context nếu có
  const contextLogger = useMemo(() => {
    if (context) {
      return createLogger(context);
    }
    return logger;
  }, [context]);

  // Tự động log page view khi location thay đổi
  useEffect(() => {
    logPageView(location.pathname, undefined, {
      search: location.search,
      hash: location.hash,
    });
  }, [location]);

  return contextLogger;
}
