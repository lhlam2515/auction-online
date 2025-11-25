import { useEffect } from "react";
import { useLocation } from "react-router";
import logger, { logPageView, type LogContext } from "@/lib/logger";

/**
 * Hook to automatically log page views
 * Simplified version - only logs page views in development
 */
export function useLogger(context?: LogContext) {
  const location = useLocation();

  // Automatically log page view when location changes
  useEffect(() => {
    logPageView(location.pathname, {
      search: location.search,
      hash: location.hash,
      ...context,
    });
  }, [location, context]);

  // Return logger for manual logging if needed
  return logger;
}
