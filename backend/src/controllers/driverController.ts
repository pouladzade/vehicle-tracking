import { Request, Response } from "express";

import logger from "../config/logger";
import { DriverInput } from "../models/driver";
import { RepositoryFactory } from "../repositories";

// Get the repository from the factory
const driverRepository = RepositoryFactory.getDriverRepository();

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const drivers = await driverRepository.findByCustomerId(req.customerId);
    res.json(drivers);
  } catch (error) {
    logger.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDriver = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid driver ID" });
    }

    const driver = await driverRepository.findById(id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    logger.error("Error fetching driver:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addDriver = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const driverData: DriverInput = {
      ...req.body,
      customer_id: req.customerId, // Ensure the customer ID is set to the authenticated customer
    };

    const driver = await driverRepository.create(driverData);
    res.status(201).json(driver);
  } catch (error) {
    logger.error("Error creating driver:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDriverById = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid driver ID" });
    }

    const driverData: DriverInput = {
      ...req.body,
      customer_id: req.customerId, // Ensure the customer ID is set to the authenticated customer
    };

    const driver = await driverRepository.update(id, driverData);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    logger.error("Error updating driver:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDriverById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid driver ID" });
    }

    const success = await driverRepository.delete(id);
    if (!success) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting driver:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
