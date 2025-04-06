import { Pool, PoolClient, QueryResult } from "pg";

import { dbConfig } from "../config/database";
import logger from "../config/logger";
import { handleDatabaseError } from "../utils/dbErrors";
import { ServerError, ErrorCode } from "../utils/errors";

const pool = new Pool(dbConfig);

// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    logger.error("Error connecting to database:", err);
  } else {
    logger.info("Database connected successfully");
  }
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;

// Store last query for debugging
let lastQuery: { text: string; params?: any[] } | null = null;

/**
 * Execute a database query with error handling
 * @param text SQL query text
 * @param params Query parameters
 * @param entity Optional entity name for error context (e.g., 'customer', 'vehicle')
 * @param operation Optional operation name for error context (e.g., 'create', 'update')
 */
export const query = async (
  text: string,
  params?: any[],
  entity?: string,
  operation?: string
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    // Store query for debugging
    lastQuery = { text, params };

    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    logger.error("Error executing query", { text, error });

    // If entity and operation were provided, use our database error handler
    if (entity && operation) {
      throw handleDatabaseError(error, operation, entity);
    }

    // Otherwise, wrap in a generic database error
    throw new ServerError("Database query failed", ErrorCode.DATABASE_ERROR, {
      message: error.message,
      detail: error.detail,
      code: error.code,
      query: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
    });
  }
};

export const getClient = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();

    // Set a timeout of 5 seconds on the client
    const timeout = setTimeout(() => {
      logger.warn("A client has been checked out for more than 5 seconds!");
    }, 5000);

    const originalRelease = client.release;

    // Override the release method to clear timeout
    client.release = () => {
      clearTimeout(timeout);
      // Reset to original release method and call it
      client.release = originalRelease;
      return originalRelease.apply(client);
    };

    return client;
  } catch (error: any) {
    logger.error("Error getting database client:", error);
    throw new ServerError(
      "Could not connect to database",
      ErrorCode.SERVICE_UNAVAILABLE,
      { message: error.message }
    );
  }
};

// Method to get the last executed query (for debugging purposes)
export const getLastQuery = () => lastQuery;
