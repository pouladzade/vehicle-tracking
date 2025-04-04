// API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Error codes matching backend ErrorCode enum
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
  INVALID_FORMAT = 1203,

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
