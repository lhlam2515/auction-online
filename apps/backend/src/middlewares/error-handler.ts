import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError, DatabaseError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";
import { ErrorCodes } from "@/types/error";
import logger from "@/config/logger";

export interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error("Error occurred:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    ResponseHandler.sendError(
      res,
      error.name,
      error.message,
      error.code,
      error.statusCode,
      req.path,
      error.details,
      error.stack
    );
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = new ValidationError("Invalid request data", {
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });

    ResponseHandler.sendError(
      res,
      validationError.name,
      validationError.message,
      validationError.code,
      validationError.statusCode,
      req.path,
      validationError.details,
      validationError.stack
    );
    return;
  }

  // Handle database errors (you can customize based on your DB driver)
  if (
    error.message?.includes("database") ||
    error.message?.includes("connection")
  ) {
    const dbError = new DatabaseError("Database operation failed", error);

    ResponseHandler.sendError(
      res,
      dbError.name,
      dbError.message,
      dbError.code,
      dbError.statusCode,
      req.path,
      dbError.details,
      dbError.stack
    );
    return;
  }

  // Handle Express built-in errors
  if (error.name === "UnauthorizedError") {
    ResponseHandler.sendError(
      res,
      "UnauthorizedError",
      "Invalid token",
      ErrorCodes.UNAUTHORIZED,
      401,
      req.path
    );
    return;
  }

  // Handle rate limiting errors
  if (error.name === "TooManyRequests") {
    ResponseHandler.sendError(
      res,
      "TooManyRequests",
      "Too many requests, please try again later",
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      429,
      req.path
    );
    return;
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || ErrorCodes.INTERNAL_SERVER_ERROR;

  ResponseHandler.sendError(
    res,
    error.name || "InternalServerError",
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message || "Something went wrong",
    code,
    statusCode,
    req.path,
    process.env.NODE_ENV === "development"
      ? { originalError: error.message }
      : undefined,
    process.env.NODE_ENV === "development" ? error.stack : undefined
  );
};

// Async wrapper to catch async errors and pass them to error handler
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found middleware
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  ResponseHandler.sendError(
    res,
    "NotFound",
    `Route ${req.originalUrl} not found`,
    ErrorCodes.NOT_FOUND,
    404,
    req.path
  );
};

// Validation middleware factory
export const validateRequest = <T>(
  schema: any,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      req[source] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};
