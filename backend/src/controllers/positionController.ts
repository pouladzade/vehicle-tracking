import { Request, Response } from "express";

import logger from "../config/logger";
import { PositionInput } from "../models/position";
import { RepositoryFactory } from "../repositories";

// Get the repositories from the factory
const positionRepository = RepositoryFactory.getPositionRepository();
const vehicleRepository = RepositoryFactory.getVehicleRepository();

export const getAllPositions = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const positions = await positionRepository.getCurrentPositionsByCustomerId(
      req.customerId
    );
    res.json(positions);
  } catch (error) {
    logger.error("Error fetching positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVehiclePositions = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    // Verify vehicle belongs to customer
    const hasAccess = await vehicleRepository.belongsToCustomer(
      vehicleId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get limit from query params, default to 100
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return res.status(400).json({
        error: "Invalid limit parameter. Must be between 1 and 1000.",
      });
    }

    const positions = await positionRepository.getPositionsByVehicleId(
      vehicleId,
      limit
    );
    res.json({ data: positions });
  } catch (error) {
    logger.error("Error fetching vehicle positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLatestVehiclePosition = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    // Verify vehicle belongs to customer
    const hasAccess = await vehicleRepository.belongsToCustomer(
      vehicleId,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const position = await positionRepository.getLastPosition(vehicleId);

    if (!position) {
      return res
        .status(404)
        .json({ error: "No position data found for vehicle" });
    }

    res.json({ data: position });
  } catch (error) {
    logger.error("Error fetching latest vehicle position:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const positionData: PositionInput = req.body;

    // Verify vehicle belongs to customer
    const hasAccess = await vehicleRepository.belongsToCustomer(
      positionData.vehicle_id,
      req.customerId
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    try {
      // Save the position first
      const position = await positionRepository.create(positionData);
      res.status(201).json({
        position,
      });
    } catch (error) {
      logger.error("Error recording position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    logger.error("Error recording position:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
