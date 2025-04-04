import { Request, Response, NextFunction } from "express";

import logger from "../config/logger";
import {
  AppError,
  NotFoundError,
  ServerError,
  sendErrorResponse,
} from "../utils/errors";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", err);

  // Send standardized error response using our utility
  sendErrorResponse(res, err, req);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundError = new NotFoundError(
    `The requested resource at ${req.originalUrl} was not found`
  );
  sendErrorResponse(res, notFoundError, req);
};
