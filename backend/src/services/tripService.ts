import logger from "../config/logger";
import { Position } from "../models/position";
import { TripInput } from "../models/trip";
import { RepositoryFactory } from "../repositories";

// Get repositories
const positionRepository = RepositoryFactory.getPositionRepository();
const tripRepository = RepositoryFactory.getTripRepository();

// Calculate distance between two geographic points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

// Calculate total trip distance based on position data
export const calculateTripDistance = (positions: Position[]): number => {
  if (positions.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  // Sort positions by timestamp (oldest first)
  const sortedPositions = [...positions].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeA - timeB;
  });

  // Calculate cumulative distance
  for (let i = 1; i < sortedPositions.length; i++) {
    const prevPos = sortedPositions[i - 1];
    const currPos = sortedPositions[i];

    const segmentDistance = calculateDistance(
      prevPos.latitude,
      prevPos.longitude,
      currPos.latitude,
      currPos.longitude
    );

    totalDistance += segmentDistance;
  }

  return totalDistance;
};

// Create a new trip with proper validation
export const createTrip = async (tripData: TripInput) => {
  try {
    // Check if there's already an active trip for this vehicle
    const activeTrip = await tripRepository.getActiveTrip(tripData.vehicle_id);
    if (activeTrip && !tripData.end_time) {
      logger.warn(
        `Vehicle ${tripData.vehicle_id} already has an active trip: ${activeTrip.id}`
      );
      return activeTrip;
    }

    return await tripRepository.create(tripData);
  } catch (error) {
    logger.error("Error creating trip:", error);
    throw error;
  }
};

// End a trip and calculate distance
export const endTripWithDistance = async (tripId: number, endTime: Date) => {
  try {
    logger.info(`Ending trip ${tripId} at ${endTime.toISOString()}`);

    // First, end the trip
    const trip = await tripRepository.endTrip(tripId, endTime);

    if (!trip) {
      logger.error(`Trip ${tripId} not found`);
      return null;
    }

    logger.info(
      `Trip ${tripId} ended, fetching positions for vehicle ${trip.vehicle_id}`
    );

    // Get positions for the trip duration
    const positions = await positionRepository.getPositionsByVehicleId(
      trip.vehicle_id
    );
    logger.info(
      `Found ${positions.length} positions for vehicle ${trip.vehicle_id}`
    );

    const tripPositions = positions.filter((pos) => {
      const posTime = pos.timestamp ? new Date(pos.timestamp).getTime() : 0;
      const startTime = new Date(trip.start_time).getTime();
      const endTime = trip.end_time
        ? new Date(trip.end_time).getTime()
        : Date.now();

      return posTime >= startTime && posTime <= endTime;
    });

    logger.info(
      `Filtered to ${tripPositions.length} positions for trip duration`
    );

    // Calculate distance
    const distance = calculateTripDistance(tripPositions);
    logger.info(`Calculated distance for trip ${tripId}: ${distance} km`);

    // Update the trip with the calculated distance
    const updatedTrip = await tripRepository.update(tripId, {
      ...trip,
      distance,
    });

    logger.info(`Updated trip ${tripId} with distance ${distance} km`);
    return updatedTrip;
  } catch (error) {
    logger.error("Error ending trip with distance:", error);
    throw error;
  }
};
