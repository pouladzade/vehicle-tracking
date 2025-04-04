import { Request, Response } from "express";

import logger from "../config/logger";
import { VehicleInput } from "../models/vehicle";
import { RepositoryFactory } from "../repositories";
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ServerError,
  ErrorCode,
  sendErrorResponse,
} from "../utils/errors";

// Get the repository from the factory
const vehicleRepository = RepositoryFactory.getVehicleRepository();
const customerRepository = RepositoryFactory.getCustomerRepository();

/**
 * Get all vehicles for the authenticated customer
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      throw new AuthenticationError("Customer ID is required");
    }

    const vehicles = await vehicleRepository.findByCustomerId(req.customerId);
    res.json({ success: true, data: vehicles });
  } catch (error: any) {
    logger.error("Error fetching vehicles:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Get a specific vehicle by ID
 */
export const getVehicle = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      throw new AuthenticationError("Customer ID is required");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid vehicle ID", ErrorCode.INVALID_INPUT, {
        param: "id",
      });
    }

    // Check if vehicle belongs to the authenticated customer
    const belongsToCustomer = await vehicleRepository.belongsToCustomer(
      id,
      req.customerId
    );
    if (!belongsToCustomer) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    logger.error("Error fetching vehicle:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Add a new vehicle for the authenticated customer
 */
export const addVehicle = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      throw new AuthenticationError("Customer ID is required");
    }

    // Validate required fields
    if (!req.body.license_plate) {
      throw new ValidationError(
        "License plate is required",
        ErrorCode.MISSING_REQUIRED_FIELD,
        { field: "license_plate" }
      );
    }

    const vehicleData: VehicleInput = {
      ...req.body,
      customer_id: req.customerId, // Ensure the customer ID is set to the authenticated customer
    };

    const vehicle = await vehicleRepository.create(vehicleData);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error: any) {
    logger.error("Error creating vehicle:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Update an existing vehicle
 */
export const updateVehicleById = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      throw new AuthenticationError("Customer ID is required");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid vehicle ID", ErrorCode.INVALID_INPUT, {
        param: "id",
      });
    }

    // Check if vehicle belongs to the authenticated customer
    const belongsToCustomer = await vehicleRepository.belongsToCustomer(
      id,
      req.customerId
    );
    if (!belongsToCustomer) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    // Validate required fields
    if (!req.body.license_plate) {
      throw new ValidationError(
        "License plate is required",
        ErrorCode.MISSING_REQUIRED_FIELD,
        { field: "license_plate" }
      );
    }

    const vehicleData: VehicleInput = {
      ...req.body,
      customer_id: req.customerId, // Ensure the customer ID is set to the authenticated customer
    };

    const vehicle = await vehicleRepository.update(id, vehicleData);
    if (!vehicle) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    logger.error("Error updating vehicle:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicleById = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      throw new AuthenticationError("Customer ID is required");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid vehicle ID", ErrorCode.INVALID_INPUT, {
        param: "id",
      });
    }

    // Check if vehicle belongs to the authenticated customer
    const belongsToCustomer = await vehicleRepository.belongsToCustomer(
      id,
      req.customerId
    );
    if (!belongsToCustomer) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    const success = await vehicleRepository.delete(id);
    if (!success) {
      throw new NotFoundError(
        "Vehicle not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { vehicleId: id }
      );
    }

    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting vehicle:", error);
    sendErrorResponse(res, error, req);
  }
};
