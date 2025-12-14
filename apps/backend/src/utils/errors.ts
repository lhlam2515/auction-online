import { AppErrorOptions, ErrorCodes } from "@/types/error";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor({ message, statusCode, code, details, cause }: AppErrorOptions) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: 400,
      code: ErrorCodes.VALIDATION_ERROR,
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super({
      message,
      statusCode: 401,
      code: ErrorCodes.UNAUTHORIZED,
    });
  }
}

export class UnverifiedEmailError extends AppError {
  constructor(message: string = "Email not verified") {
    super({
      message,
      statusCode: 401,
      code: ErrorCodes.EMAIL_NOT_VERIFIED,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super({
      message,
      statusCode: 403,
      code: ErrorCodes.FORBIDDEN,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super({
      message: `${resource} not found`,
      statusCode: 404,
      code: ErrorCodes.NOT_FOUND,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: 409,
      code: ErrorCodes.RESOURCE_CONFLICT,
      details,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", cause?: Error) {
    super({
      message,
      statusCode: 500,
      code: ErrorCodes.DATABASE_ERROR,
      cause,
    });
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = "Not implemented") {
    super({
      message,
      statusCode: 501,
      code: "NOT_IMPLEMENTED",
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, cause?: Error) {
    super({
      message: `External service '${service}' unavailable`,
      statusCode: 503,
      code: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      cause,
    });
  }
}
