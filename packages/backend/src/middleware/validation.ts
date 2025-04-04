import { Request, Response, NextFunction } from "express";

import logger from "../config/logger";
import {
  ValidationError,
  ErrorCode,
  createValidationError,
  sendErrorResponse,
} from "../utils/errors";
import {
  validateVehicle,
  validateDriver,
  validateCustomer,
  validatePosition,
  validateTrip,
} from "../utils/validators";

// Generic validation middleware factory
const createValidator = (validatorFn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validatorFn(req.body);
      if (error) {
        // Using our standardized ValidationError with field details
        const fieldError = error.details[0];
        const validationError = new ValidationError(
          fieldError.message,
          ErrorCode.VALIDATION_ERROR,
          { field: fieldError.path[0], value: fieldError.context?.value }
        );
        return sendErrorResponse(res, validationError, req);
      }
      next();
    } catch (err) {
      logger.error("Validation error:", err);
      const validationError = new ValidationError(
        "Validation processing error",
        ErrorCode.VALIDATION_ERROR
      );
      return sendErrorResponse(res, validationError, req);
    }
  };
};

// Create a validator middleware for each model
export const validateVehicleMiddleware = createValidator(validateVehicle);
export const validateDriverMiddleware = createValidator(validateDriver);
export const validateCustomerMiddleware = createValidator(validateCustomer);
export const validatePositionMiddleware = createValidator(validatePosition);
export const validateTripMiddleware = createValidator(validateTrip);
