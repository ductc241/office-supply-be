import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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

    const details =
      exceptionResponse && typeof exceptionResponse === "object"
        ? (exceptionResponse as any).details || null
        : null;

    response.status(status).json({
      statusCode: status,
      errorCode: this.mapToErrorCode(exception),
      message: typeof message === "string" ? message : "Error occurred",
      timestamp: new Date().toISOString(),
      errors: details,
      raw: exception,
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
