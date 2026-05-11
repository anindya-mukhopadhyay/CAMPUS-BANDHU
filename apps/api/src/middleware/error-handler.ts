import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { logger } from "../config/logger";
import { HttpError } from "../utils/http-error";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    const typedError = error as HttpError;
    response.status(typedError.statusCode).json({ success: false, message: typedError.message });
    return;
  }

  logger.error({ err: error }, "Unhandled server error");

  response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error"
  });
}
