import { Request, Response, NextFunction } from "express";

import logger from "../config/logger";
import { RepositoryFactory } from "../repositories";

// Get the repositories from the factory
const customerRepository = RepositoryFactory.getCustomerRepository();
const vehicleRepository = RepositoryFactory.getVehicleRepository();
const driverRepository = RepositoryFactory.getDriverRepository();
const tripRepository = RepositoryFactory.getTripRepository();

// Extend the Request interface to add customerId property
declare global {
  namespace Express {
    interface Request {
      customerId?: number;
    }
  }
}

export const authenticateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.headers["x-customer-id"];
    if (!customerId) {
      return res.status(401).json({ error: "Customer ID is required" });
    }

    // Verify customer exists
    const customer = await customerRepository.findById(Number(customerId));
    if (!customer) {
      return res.status(401).json({ error: "Invalid customer ID" });
    }

    // Add customer ID to request for use in controllers
    req.customerId = Number(customerId);
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkVehicleOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const vehicleId = parseInt(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    // Use the repository to check vehicle ownership
    const hasAccess = await vehicleRepository.belongsToCustomer(
      vehicleId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    logger.error("Vehicle ownership check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkDriverOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const driverId = parseInt(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ error: "Invalid driver ID" });
    }

    const hasAccess = await driverRepository.belongsToCustomer(
      driverId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    logger.error("Driver ownership check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkTripOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const hasAccess = await tripRepository.belongsToCustomer(
      tripId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    logger.error("Trip ownership check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkVehicleOwnershipByVehicleId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    // Use the repository to check vehicle ownership
    const hasAccess = await vehicleRepository.belongsToCustomer(
      vehicleId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    logger.error("Vehicle ownership check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
