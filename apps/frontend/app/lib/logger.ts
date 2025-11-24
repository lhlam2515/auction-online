import pino from "pino";

// Type definitions for better TypeScript support
export interface LogContext {
  [key: string]: unknown;
}

export interface ErrorContext extends LogContext {
  userId?: string;
  path?: string;
  action?: string;
}

export interface ApiCallContext extends LogContext {
  requestId?: string;
  userId?: string;
  requestBody?: unknown;
  responseBody?: unknown;
}

// Environment variables for logger configuration
const isEdge = import.meta.env.VITE_RUNTIME_ENV === "edge";
const isProduction = import.meta.env.PROD;
const logLevel =
  import.meta.env.VITE_LOG_LEVEL || (isProduction ? "warn" : "debug");

// Browser-specific configuration
const logger = pino({
  level: logLevel,
  base: {
    service: "auction-frontend",
    environment: import.meta.env.MODE || "development",
    version: "1.0.0",
  },
  transport:
    !isEdge && !isProduction
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  browser: {
    asObject: true,
    serialize: true,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
  },
});

// Helper functions for structured logging
export const createLogger = (context: string | LogContext) => {
  const contextObj = typeof context === "string" ? { context } : context;
  return logger.child(contextObj);
};

// Utility functions for common logging patterns
export const logError = (error: Error | unknown, context?: ErrorContext) => {
  const errorDetails = {
    ...context,
    error: {
      name: error instanceof Error ? error.name : "Unknown Error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  };
  logger.error(errorDetails, "Error occurred");
};

export const logApiCall = (
  method: string,
  url: string,
  status?: number,
  duration?: number,
  details?: ApiCallContext
) => {
  const logData = {
    method,
    url,
    status,
    duration,
    ...details,
  };

  if (status && status >= 400) {
    logger.error(logData, `API call failed: ${method} ${url}`);
  } else {
    logger.info(logData, `API call: ${method} ${url}`);
  }
};

export const logPageView = (
  path: string,
  userId?: string,
  details?: LogContext
) => {
  logger.info(
    {
      path,
      userId,
      ...details,
    },
    `Page view: ${path}`
  );
};

// Export the main logger
export default logger;
