import { handleDatabaseError } from "../utils/dbErrors";
import {
  ServerError,
  ValidationError,
  ConflictError,
  NotFoundError,
  ErrorCode,
  AppError,
} from "../utils/errors";

// Mock PostgreSQL error objects
const createPgError = (
  code: string,
  detail?: string,
  constraint?: string,
  column?: string
) => {
  return {
    code,
    detail,
    constraint,
    column,
    message: "Database error",
    name: "error",
    severity: "ERROR",
    where: "",
    file: "",
    line: "",
    routine: "",
    toString: () => "Database error",
  };
};

describe("Database Error Handling Utility", () => {
  describe("handleDatabaseError", () => {
    it("should convert unique violation errors to ConflictError", () => {
      const pgError = createPgError(
        "23505", // unique_violation
        "Key (email)=(test@example.com) already exists",
        "customers_email_key"
      );

      const error = handleDatabaseError(pgError, "create", "customer");

      expect(error).toBeInstanceOf(ConflictError);
      expect((error as AppError).errorCode).toBe(
        ErrorCode.RESOURCE_ALREADY_EXISTS
      );
      expect(error.message).toContain("already exists");
      expect((error as AppError).details).toHaveProperty("field", "email");
    });

    it("should convert foreign key violation errors to NotFoundError", () => {
      const pgError = createPgError(
        "23503", // foreign_key_violation
        'Key (customer_id)=(999) is not present in table "customers"',
        "vehicles_customer_id_fkey"
      );

      const error = handleDatabaseError(pgError, "create", "vehicle");

      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as AppError).errorCode).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(error.message).toContain("does not exist");
    });

    it("should convert not null violation errors to ServerError", () => {
      const pgError = createPgError(
        "23502", // not_null_violation
        'Null value in column "license_plate"',
        "",
        "license_plate"
      );

      const error = handleDatabaseError(pgError, "create", "vehicle");

      expect(error).toBeInstanceOf(ServerError);
      expect((error as AppError).errorCode).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.message).toContain("Required field is missing");
      expect((error as AppError).details).toHaveProperty(
        "field",
        "license_plate"
      );
    });

    it("should handle database connection errors", () => {
      const pgError = createPgError(
        "08006", // connection_failure
        "connection error",
        ""
      );

      const error = handleDatabaseError(pgError, "query", "position");

      expect(error).toBeInstanceOf(ServerError);
      expect((error as AppError).errorCode).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(error.message).toContain("Database connection error");
    });

    it("should handle undefined column errors", () => {
      const pgError = createPgError(
        "42703", // undefined_column
        'Column "unknown_column" does not exist',
        "",
        "unknown_column"
      );

      const error = handleDatabaseError(pgError, "query", "vehicle");

      expect(error).toBeInstanceOf(ServerError);
      expect((error as AppError).errorCode).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.message).toContain("Database column not found");
    });

    it("should handle unknown database errors as ServerError", () => {
      const pgError = createPgError(
        "99999", // unknown error code
        "",
        ""
      );

      const error = handleDatabaseError(pgError, "update", "driver");

      expect(error).toBeInstanceOf(ServerError);
      expect((error as AppError).errorCode).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.message).toContain("Database error occurred");
    });

    it("should handle non-database errors as ServerError", () => {
      const randomError = new Error("Random error");

      const error = handleDatabaseError(randomError, "query", "trip");

      expect(error).toBeInstanceOf(ServerError);
      expect((error as AppError).errorCode).toBe(ErrorCode.DATABASE_ERROR);
    });
  });
});
