import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import logger from "@/config/logger";
import { ErrorCodes } from "@/types/error";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

const toAppError = (error: Error, req: Request): AppError => {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return new BadRequestError("Validation failed", {
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  const err = error as Error & { statusCode?: number; code?: string };

  // Database duplicate key
  if (err.message?.includes("duplicate key") || err.code === "23505") {
    return new ConflictError("Resource already exists");
  }

  // Database errors
  if (
    err.message?.includes("database") ||
    err.message?.includes("connection") ||
    err.code?.startsWith("23") ||
    err.code?.startsWith("42")
  ) {
    return new DatabaseError("Database operation failed", error);
  }

  // JWT/Auth errors
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError" ||
    err.name === "UnauthorizedError"
  ) {
    return new UnauthorizedError(
      err.name === "TokenExpiredError"
        ? "Token has expired"
        : "Invalid or missing authentication token"
    );
  }

  // Rate limiting
  if (err.name === "TooManyRequests" || err.statusCode === 429) {
    return new AppError({
      message: "Too many requests, please try again later",
      statusCode: 429,
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  }

  // Payload too large
  if (err.name === "PayloadTooLargeError" || err.statusCode === 413) {
    return new BadRequestError("Request payload too large");
  }

  // Default internal server error
  return new AppError({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
    code: err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
  });
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error("Error occurred:", {
    name: error.name,
    message: error.message,
    cause: error.cause || undefined,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  const appError = toAppError(error, req);
  ResponseHandler.sendError(res, appError, req.path);
};

// Async wrapper to catch async errors and pass them to error handler
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

// Not found middleware
export const notFound = (req: Request, res: Response): void => {
  const notFoundError = new NotFoundError(`Route ${req.originalUrl}`);
  ResponseHandler.sendError(res, notFoundError, req.path);
};
