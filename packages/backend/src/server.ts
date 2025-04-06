import fs from "fs";
import path from "path";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import logger from "./config/logger";
import swaggerSpec from "./config/swagger";
import { query } from "./db";
import { authenticateCustomer } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/error";

// Import routes
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import driverRoutes from "./routes/driverRoutes";
import positionRoutes from "./routes/positionRoutes";
import tripRoutes from "./routes/tripRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

// Protected routes
app.use("/api/vehicles", authenticateCustomer, vehicleRoutes);
app.use("/api/drivers", authenticateCustomer, driverRoutes);
app.use("/api/positions", authenticateCustomer, positionRoutes);
app.use("/api/trips", authenticateCustomer, tripRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve the login page
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database with retry mechanism
const initializeDatabase = async (
  attempt = 1,
  maxAttempts = 5
): Promise<boolean> => {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // Test database connection
    await query("SELECT NOW()");
    logger.info("Database connection established successfully");

    // Check if we have sample data
    const checkCustomers = await query("SELECT COUNT(*) FROM customers");

    if (parseInt(checkCustomers.rows[0].count) === 0) {
      logger.info(
        "No data found in database. Tables may be empty despite initialization scripts."
      );
      logger.info(
        "This can happen if the Docker init scripts did not run correctly."
      );
      logger.info(
        "You may want to manually run the sample-data.sql script to add test data."
      );
    } else {
      logger.info(
        `Found ${checkCustomers.rows[0].count} customers in database.`
      );

      // Check for vehicles and drivers
      const checkVehicles = await query("SELECT COUNT(*) FROM vehicles");
      const checkDrivers = await query("SELECT COUNT(*) FROM drivers");

      logger.info(
        `Found ${checkVehicles.rows[0].count} vehicles and ${checkDrivers.rows[0].count} drivers in database.`
      );
    }

    return true;
  } catch (error) {
    if (attempt < maxAttempts) {
      const retrySeconds = Math.min(Math.pow(2, attempt), 30);
      logger.warn(
        `Database connection failed (attempt ${attempt}/${maxAttempts}). Retrying in ${retrySeconds} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, retrySeconds * 1000));
      return initializeDatabase(attempt + 1, maxAttempts);
    } else {
      logger.error(
        "Database initialization failed after maximum attempts:",
        error
      );
      return false;
    }
  }
};

// Start server
const startServer = async () => {
  const dbInitialized = await initializeDatabase();

  if (!dbInitialized) {
    logger.error("Cannot start server: Database initialization failed");
    process.exit(1);
  }

  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});

export { app };
