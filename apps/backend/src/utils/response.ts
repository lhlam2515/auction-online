import { Response } from "express";
import { ErrorResponse, SuccessResponse } from "@/types/error";

class ApiResponseBuilder {
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  static error(
    name: string,
    message: string,
    code: string,
    statusCode: number,
    path: string,
    details?: unknown,
    stack?: string
  ): ErrorResponse {
    return {
      success: false,
      error: {
        name,
        message,
        code,
        statusCode,
        timestamp: new Date().toISOString(),
        path,
        details,
        ...(process.env.NODE_ENV === "development" && { stack }),
      },
    };
  }
}

export class ResponseHandler {
  static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string
  ): Response<SuccessResponse<T>> {
    return res
      .status(statusCode)
      .json(ApiResponseBuilder.success(data, message));
  }

  static sendError(
    res: Response,
    name: string,
    message: string,
    code: string,
    statusCode: number,
    path: string,
    details?: unknown,
    stack?: string
  ): Response<ErrorResponse> {
    return res
      .status(statusCode)
      .json(
        ApiResponseBuilder.error(
          name,
          message,
          code,
          statusCode,
          path,
          details,
          stack
        )
      );
  }

  static sendCreated<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<SuccessResponse<T>> {
    return this.sendSuccess(res, data, 201, message);
  }

  static sendNoContent(res: Response): Response {
    return res.status(204).send();
  }
}
