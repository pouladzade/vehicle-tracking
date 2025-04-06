import { ServerError, ConflictError, NotFoundError, ErrorCode } from "./errors";
import logger from "../config/logger";

/**
 * PostgreSQL error codes
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export enum PostgresErrorCode {
  // Class 23 — Integrity Constraint Violation
  UNIQUE_VIOLATION = "23505",
  FOREIGN_KEY_VIOLATION = "23503",
  CHECK_VIOLATION = "23514",
  NOT_NULL_VIOLATION = "23502",

  // Class 42 — Syntax Error or Access Rule Violation
  UNDEFINED_TABLE = "42P01",
  UNDEFINED_COLUMN = "42703",

  // Class 08 — Connection Exception
  CONNECTION_EXCEPTION = "08000",
  CONNECTION_FAILURE = "08006",
}

/**
 * Determine if an error is a PostgreSQL database error
 */
export const isPostgresError = (err: any): boolean => {
  return err && typeof err === "object" && "code" in err && "routine" in err;
};

/**
 * Map a database error to an appropriate API error
 */
export const handleDatabaseError = (
  error: any,
  operation: string,
  entity: string
): Error => {
  // Log the original error
  logger.error(`Database error during ${operation} ${entity}:`, error);

  // If it's not a recognizable Postgres error, return a generic server error
  if (!isPostgresError(error)) {
    return new ServerError(
      `An error occurred with the database during ${operation} ${entity}`,
      ErrorCode.DATABASE_ERROR,
      { originalError: error.message || "Unknown error" }
    );
  }

  // Handle specific PostgreSQL error codes
  switch (error.code) {
    case PostgresErrorCode.UNIQUE_VIOLATION:
      // Extract the constraint name and field from the error detail
      const detail = error.detail || "";
      const constraint = error.constraint || "";
      const match = detail.match(/Key \((.+?)\)=\((.+?)\)/);
      const field = match ? match[1] : "field";
      const value = match ? match[2] : "";

      return new ConflictError(
        `A ${entity} with this ${field} already exists`,
        ErrorCode.RESOURCE_ALREADY_EXISTS,
        { field, value, constraint }
      );

    case PostgresErrorCode.FOREIGN_KEY_VIOLATION:
      // Foreign key violations can be either:
      // 1. Trying to reference a non-existent ID (e.g., assigning to a non-existent parent)
      // 2. Trying to delete a record that has dependent records

      if (error.detail?.includes("still referenced")) {
        // Case 2: Cannot delete because of dependent records
        return new ConflictError(
          `Cannot delete this ${entity} because it is still referenced by other records`,
          ErrorCode.RESOURCE_CONFLICT,
          { constraint: error.constraint }
        );
      } else {
        // Case 1: Referenced ID doesn't exist
        return new NotFoundError(
          `The referenced record does not exist`,
          ErrorCode.RESOURCE_NOT_FOUND,
          { constraint: error.constraint }
        );
      }

    case PostgresErrorCode.NOT_NULL_VIOLATION:
      return new ServerError(
        `Required field is missing: ${error.column || "unknown field"}`,
        ErrorCode.DATABASE_ERROR,
        { field: error.column }
      );

    case PostgresErrorCode.UNDEFINED_TABLE:
      return new ServerError(
        `Database table not found`,
        ErrorCode.DATABASE_ERROR,
        { table: error.table }
      );

    case PostgresErrorCode.UNDEFINED_COLUMN:
      return new ServerError(
        `Database column not found`,
        ErrorCode.DATABASE_ERROR,
        { column: error.column }
      );

    case PostgresErrorCode.CONNECTION_EXCEPTION:
    case PostgresErrorCode.CONNECTION_FAILURE:
      return new ServerError(
        `Database connection error`,
        ErrorCode.SERVICE_UNAVAILABLE,
        { originalError: error.message }
      );

    default:
      return new ServerError(
        `Database error occurred`,
        ErrorCode.DATABASE_ERROR,
        {
          pgCode: error.code,
          detail: error.detail,
          message: error.message,
        }
      );
  }
};
