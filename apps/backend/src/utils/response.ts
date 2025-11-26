import { Response } from "express";
import { ErrorResponse, SuccessResponse } from "@/types/error";
import { AppError } from "./errors";

export class ResponseHandler {
  static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string
  ): Response<SuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  static sendError(
    res: Response,
    error: AppError,
    path: string
  ): Response<ErrorResponse> {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        path,
        details: error.details,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
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
