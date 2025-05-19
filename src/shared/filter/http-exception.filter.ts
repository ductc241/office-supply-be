import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exceptionResponse && typeof exceptionResponse === "object"
        ? (exceptionResponse as any).message || "Internal server error"
        : exceptionResponse || "Internal server error";

    response.status(status).json({
      statusCode: status,
      message: typeof message === "string" ? message : "Error occurred",
      errorCode: this.mapToErrorCode(exception),
      errors: Array.isArray(message) ? message : null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapToErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          return "VALIDATION_ERROR";
        case HttpStatus.UNAUTHORIZED:
          return "UNAUTHORIZED";
        case HttpStatus.NOT_FOUND:
          return "RESOURCE_NOT_FOUND";
        case HttpStatus.INTERNAL_SERVER_ERROR:
        default:
          return "INTERNAL_SERVER_ERROR";
      }
    }
    return "UNKNOWN_ERROR";
  }
}
