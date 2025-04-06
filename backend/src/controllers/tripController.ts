import { Request, Response } from "express";

import logger from "../config/logger";
import { TripInput } from "../models/trip";
import { RepositoryFactory } from "../repositories";
import { endTripWithDistance } from "../services/tripService";

// Get the repositories from the factory
const tripRepository = RepositoryFactory.getTripRepository();
const vehicleRepository = RepositoryFactory.getVehicleRepository();
const driverRepository = RepositoryFactory.getDriverRepository();

export const getAllTrips = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const trips = await tripRepository.findByCustomerId(req.customerId);
    res.json(trips);
  } catch (error) {
    logger.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await tripRepository.findDetailedById(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Return a standardized response format
    res.json({ data: trip });
  } catch (error) {
    logger.error("Error fetching trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVehicleTrips = async (req: Request, res: Response) => {
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

    const trips = await tripRepository.findByVehicleId(vehicleId);
    res.json(trips);
  } catch (error) {
    logger.error("Error fetching vehicle trips:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addTrip = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tripData: TripInput = {
      vehicle_id: req.body.vehicle_id,
      driver_id: req.body.driver_id,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      distance: req.body.distance,
    };

    // Verify vehicle belongs to customer
    const vehicleAccess = await vehicleRepository.belongsToCustomer(
      tripData.vehicle_id,
      req.customerId
    );
    if (!vehicleAccess) {
      return res
        .status(403)
        .json({ error: "Access denied - vehicle does not belong to customer" });
    }

    // Verify driver belongs to customer
    const driverAccess = await driverRepository.belongsToCustomer(
      tripData.driver_id,
      req.customerId
    );
    if (!driverAccess) {
      return res
        .status(403)
        .json({ error: "Access denied - driver does not belong to customer" });
    }

    const trip = await tripRepository.create(tripData);
    res.status(201).json(trip);
  } catch (error) {
    logger.error("Error creating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTripById = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const tripData: TripInput = {
      vehicle_id: req.body.vehicle_id,
      driver_id: req.body.driver_id,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      distance: req.body.distance,
    };

    // Verify vehicle belongs to customer
    const vehicleAccess = await vehicleRepository.belongsToCustomer(
      tripData.vehicle_id,
      req.customerId
    );
    if (!vehicleAccess) {
      return res
        .status(403)
        .json({ error: "Access denied - vehicle does not belong to customer" });
    }

    // Verify driver belongs to customer
    const driverAccess = await driverRepository.belongsToCustomer(
      tripData.driver_id,
      req.customerId
    );
    if (!driverAccess) {
      return res
        .status(403)
        .json({ error: "Access denied - driver does not belong to customer" });
    }

    const trip = await tripRepository.update(id, tripData);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    logger.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * End a trip and calculate the distance based on recorded positions
 */
export const endTrip = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    // Get the trip to check if it belongs to the customer
    const existingTrip = await tripRepository.findDetailedById(id);
    if (!existingTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Verify trip belongs to customer for security
    const tripAccess = await tripRepository.belongsToCustomer(
      id,
      req.customerId
    );
    if (!tripAccess) {
      return res.status(403).json({
        error: "Access denied - trip does not belong to customer",
      });
    }

    // If trip is already ended, return an error
    if (existingTrip.end_time) {
      return res.status(400).json({
        error: "Trip has already been ended",
      });
    }

    // Use the endTripWithDistance service to calculate distance
    const endTime = new Date();
    const updatedTrip = await endTripWithDistance(id, endTime);

    if (!updatedTrip) {
      return res.status(404).json({ error: "Failed to end trip" });
    }

    res.json(updatedTrip);
  } catch (error) {
    logger.error("Error ending trip:", error);
    res.status(500).json({
      error: "Error ending trip",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteTripById = async (req: Request, res: Response) => {
  try {
    if (!req.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    // Get the trip to check if it belongs to the customer
    const tripAccess = await tripRepository.belongsToCustomer(
      id,
      req.customerId
    );
    if (!tripAccess) {
      return res.status(403).json({
        error: "Access denied - trip does not belong to customer",
      });
    }

    // Delete the trip
    const success = await tripRepository.delete(id);
    if (!success) {
      return res.status(404).json({ error: "Failed to delete trip" });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
