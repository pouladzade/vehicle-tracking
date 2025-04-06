import { Response } from "express";

/**
 * Error codes for consistent client-side error handling
 */
export enum ErrorCode {
  // Authentication errors (1000-1099)
  UNAUTHORIZED = 1000,
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,

  // Resource errors (1100-1199)
  RESOURCE_NOT_FOUND = 1100,
  RESOURCE_ALREADY_EXISTS = 1101,
  RESOURCE_CONFLICT = 1102,

  // Validation errors (1200-1299)
  VALIDATION_ERROR = 1200,
  INVALID_INPUT = 1201,
  MISSING_FIELD = 1202,
  MISSING_REQUIRED_FIELD = 1203,
  INVALID_FORMAT = 1204,

  // Business logic errors (1300-1399)
  BUSINESS_RULE_VIOLATION = 1300,
  OPERATION_NOT_ALLOWED = 1301,

  // Database errors (1400-1499)
  DATABASE_ERROR = 1400,
  QUERY_FAILED = 1401,

  // Server errors (1500-1599)
  INTERNAL_ERROR = 1500,
  SERVICE_UNAVAILABLE = 1501,

  // Third-party service errors (1600-1699)
  EXTERNAL_SERVICE_ERROR = 1600,
}

/**
 * Standardized API error response structure
 */
export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

/**
 * Base AppError class for standardized error handling
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly errorCode: ErrorCode;
  readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    // Capture stack trace (Node.js specific)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - ValidationError
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation error",
    errorCode: ErrorCode = ErrorCode.VALIDATION_ERROR,
    details?: any
  ) {
    super(message, 400, errorCode, details);
  }
}

/**
 * 401 Unauthorized - AuthenticationError
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    errorCode: ErrorCode = ErrorCode.UNAUTHORIZED,
    details?: any
  ) {
    super(message, 401, errorCode, details);
  }
}

/**
 * 403 Forbidden - AuthorizationError
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    errorCode: ErrorCode = ErrorCode.OPERATION_NOT_ALLOWED,
    details?: any
  ) {
    super(message, 403, errorCode, details);
  }
}

/**
 * 404 Not Found - NotFoundError
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    errorCode: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    details?: any
  ) {
    super(message, 404, errorCode, details);
  }
}

/**
 * 409 Conflict - ConflictError
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    errorCode: ErrorCode = ErrorCode.RESOURCE_CONFLICT,
    details?: any
  ) {
    super(message, 409, errorCode, details);
  }
}

/**
 * 500 Internal Server Error - ServerError
 */
export class ServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message, 500, errorCode, details);
  }
}

/**
 * 503 Service Unavailable - ServiceUnavailableError
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = "Service unavailable",
    errorCode: ErrorCode = ErrorCode.SERVICE_UNAVAILABLE,
    details?: any
  ) {
    super(message, 503, errorCode, details);
  }
}

/**
 * Format error response using the standardized structure
 */
export const formatErrorResponse = (error: AppError, req?: any): ApiError => {
  return {
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      details: error.details,
    },
    timestamp: new Date().toISOString(),
    path: req?.originalUrl,
  };
};

/**
 * Send a standardized error response
 */
export const sendErrorResponse = (
  res: Response,
  error: AppError | Error,
  req?: any
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(formatErrorResponse(error, req));
  } else {
    // For regular Error instances, convert to ServerError
    const serverError = new ServerError(
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message
    );
    res
      .status(serverError.statusCode)
      .json(formatErrorResponse(serverError, req));
  }
};

/**
 * Helper to create a validation error with multiple field errors
 */
export const createValidationError = (
  fieldErrors: Record<string, string>
): ValidationError => {
  return new ValidationError("Validation failed", ErrorCode.VALIDATION_ERROR, {
    fields: fieldErrors,
  });
};
