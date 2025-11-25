// Type definitions
export interface LogContext {
  [key: string]: unknown;
}

// Environment check
const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Log levels
type LogLevel = "debug" | "info" | "warn" | "error";

// Color codes for browser console
const colors = {
  debug: "color: #A78BFA; font-weight: normal;", // Light Purple - for debugging
  info: "color: #22C55E; font-weight: bold;", // Bright Green - success/info
  warn: "color: #FBB040; font-weight: bold;", // Bright Orange - warnings
  error:
    // Bright Red with dark background - critical errors
    "color: #FF5555; font-weight: bold; background: #2D0A0A; padding: 2px 4px;",
  timestamp: "color: #64748B; font-weight: normal;", // Medium Gray
  context: "color: #06B6D4; font-weight: normal;", // Cyan - for context data
};

class SimpleLogger {
  private shouldLog(level: LogLevel): boolean {
    if (isProduction && level === "debug") return false;
    return true;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): [string, ...string[]] {
    const timestamp = new Date().toISOString();

    if (context && Object.keys(context).length > 0) {
      const contextStr = JSON.stringify(context, null, 2);
      return [
        `%c[${timestamp}]%c [${level.toUpperCase()}]%c ${message}\n%cContext:%c\n${contextStr}`,
        colors.timestamp,
        colors[level],
        "color: inherit;",
        colors.context,
        "color: inherit;",
      ];
    }

    return [
      `%c[${timestamp}]%c [${level.toUpperCase()}]%c ${message}`,
      colors.timestamp,
      colors[level],
      "color: inherit;",
    ];
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog("debug")) return;
    const [format, ...styles] = this.formatMessage("debug", message, context);
    console.debug(format, ...styles);
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog("info")) return;
    const [format, ...styles] = this.formatMessage("info", message, context);
    console.info(format, ...styles);
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog("warn")) return;
    const [format, ...styles] = this.formatMessage("warn", message, context);
    console.warn(format, ...styles);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    if (!this.shouldLog("error")) return;

    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    const fullContext = {
      error: errorDetails,
      ...context,
    };

    const [format, ...styles] = this.formatMessage(
      "error",
      message,
      fullContext
    );
    console.error(format, ...styles);
  }
}

// Singleton instance
const logger = new SimpleLogger();

// Export default logger
export default logger;

/**
 * Helper function to log errors (only in development)
 */
export const logError = (error: Error | unknown, context?: LogContext) => {
  if (isDev) {
    logger.error("Error occurred", error, context);
  }
};

/**
 * Helper function to log page views (only in development)
 */
export const logPageView = (path: string, context?: LogContext) => {
  if (isDev) {
    logger.debug(`Page view: ${path}`, context);
  }
};
