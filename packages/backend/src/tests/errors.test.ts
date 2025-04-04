import { Request, Response } from "express";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServerError,
  ServiceUnavailableError,
  ErrorCode,
  formatErrorResponse,
  sendErrorResponse,
  createValidationError,
} from "../utils/errors";

// Mock Express Response
const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

// Mock Express Request
const mockRequest = () => {
  const req: Partial<Request> = {
    originalUrl: "/api/test",
  };
  return req as Request;
};

describe("Error Handling Utilities", () => {
  describe("AppError", () => {
    it("should create a base error with correct properties", () => {
      const error = new AppError(
        "Test error",
        400,
        ErrorCode.VALIDATION_ERROR,
        { field: "test" }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("AppError");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: "test" });
      expect(error.stack).toBeDefined();
    });
  });

  describe("ValidationError", () => {
    it("should create with default values", () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe("Validation error");
    });

    it("should create with custom message and error code", () => {
      const error = new ValidationError(
        "Invalid input",
        ErrorCode.INVALID_INPUT,
        { field: "email" }
      );

      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe(ErrorCode.INVALID_INPUT);
      expect(error.message).toBe("Invalid input");
      expect(error.details).toEqual({ field: "email" });
    });
  });

  describe("AuthenticationError", () => {
    it("should create with default values", () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe("Authentication required");
    });
  });

  describe("AuthorizationError", () => {
    it("should create with default values", () => {
      const error = new AuthorizationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe(ErrorCode.OPERATION_NOT_ALLOWED);
      expect(error.message).toBe("Access denied");
    });
  });

  describe("NotFoundError", () => {
    it("should create with default values", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(error.message).toBe("Resource not found");
    });
  });

  describe("ConflictError", () => {
    it("should create with default values", () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe(ErrorCode.RESOURCE_CONFLICT);
      expect(error.message).toBe("Resource conflict");
    });
  });

  describe("ServerError", () => {
    it("should create with default values", () => {
      const error = new ServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe("Internal server error");
    });
  });

  describe("ServiceUnavailableError", () => {
    it("should create with default values", () => {
      const error = new ServiceUnavailableError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(error.message).toBe("Service unavailable");
    });
  });

  describe("formatErrorResponse", () => {
    it("should format an error into the API error structure", () => {
      const error = new ValidationError(
        "Invalid data",
        ErrorCode.INVALID_INPUT,
        { field: "email" }
      );
      const req = mockRequest();

      const formattedError = formatErrorResponse(error, req);

      expect(formattedError).toMatchObject({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: "Invalid data",
          details: { field: "email" },
        },
        path: "/api/test",
      });
      expect(formattedError.timestamp).toBeDefined();
    });

    it("should work without a request object", () => {
      const error = new ValidationError("Invalid data");

      const formattedError = formatErrorResponse(error);

      expect(formattedError).toMatchObject({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid data",
        },
      });
      expect(formattedError.path).toBeUndefined();
    });
  });

  describe("sendErrorResponse", () => {
    it("should send a formatted error response for AppError", () => {
      const error = new ValidationError(
        "Invalid data",
        ErrorCode.INVALID_INPUT
      );
      const res = mockResponse();
      const req = mockRequest();

      sendErrorResponse(res, error, req);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.INVALID_INPUT,
            message: "Invalid data",
          }),
        })
      );
    });

    it("should convert regular Error to ServerError", () => {
      const error = new Error("Unknown error");
      const res = mockResponse();

      sendErrorResponse(res, error);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
          }),
        })
      );
    });
  });

  describe("createValidationError", () => {
    it("should create a ValidationError with field errors", () => {
      const fieldErrors = {
        email: "Invalid email format",
        password: "Password is too short",
      };

      const error = createValidationError(fieldErrors);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe("Validation failed");
      expect(error.details).toEqual({ fields: fieldErrors });
    });
  });
});
