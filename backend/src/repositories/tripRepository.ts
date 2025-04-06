import { query } from "../db";
import { Trip, TripInput, TripDetails } from "../models/trip";
import logger from "../config/logger";

import { Repository } from "./baseRepository";

/**
 * Trip-specific repository interface that extends the base repository
 */
export interface TripRepository extends Repository<Trip, number, TripInput> {
  /**
   * Find all trips belonging to a specific customer
   * @param customerId Customer ID
   */
  findByCustomerId(customerId: number): Promise<TripDetails[]>;

  /**
   * Get detailed trip information by ID
   * @param id Trip ID
   */
  findDetailedById(id: number): Promise<TripDetails | null>;

  /**
   * Get an active trip for a vehicle (where end_time is null)
   * @param vehicleId Vehicle ID
   */
  getActiveTrip(vehicleId: number): Promise<Trip | null>;

  /**
   * End a trip by setting its end time
   * @param id Trip ID
   * @param endTime End time
   */
  endTrip(id: number, endTime: Date): Promise<Trip | null>;

  /**
   * Find trips by vehicle ID
   * @param vehicleId Vehicle ID
   */
  findByVehicleId(vehicleId: number): Promise<Trip[]>;

  /**
   * Check if a trip belongs to a customer
   * @param tripId Trip ID
   * @param customerId Customer ID
   */
  belongsToCustomer(tripId: number, customerId: number): Promise<boolean>;
}

export class PostgresTripRepository implements TripRepository {
  async findAll(): Promise<Trip[]> {
    const result = await query("SELECT * FROM trips ORDER BY start_time DESC");
    return result.rows;
  }

  async findById(id: number): Promise<Trip | null> {
    const result = await query("SELECT * FROM trips WHERE id = $1", [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  async findDetailedById(id: number): Promise<TripDetails | null> {
    const result = await query(
      `
      SELECT 
          t.*,
          v.license_plate,
          d.first_name as driver_first_name,
          d.last_name as driver_last_name
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = $1
      `,
      [id]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async create(data: TripInput): Promise<Trip> {
    const result = await query(
      "INSERT INTO trips (vehicle_id, driver_id, start_time, end_time, distance) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        data.vehicle_id,
        data.driver_id,
        data.start_time || new Date(),
        data.end_time,
        data.distance || 0,
      ]
    );
    return result.rows[0];
  }

  async update(id: number, data: TripInput): Promise<Trip | null> {
    const result = await query(
      "UPDATE trips SET vehicle_id = $1, driver_id = $2, start_time = $3, end_time = $4, distance = $5 WHERE id = $6 RETURNING *",
      [
        data.vehicle_id,
        data.driver_id,
        data.start_time || new Date(),
        data.end_time,
        data.distance || 0,
        id,
      ]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM trips WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error("Error deleting trip:", error);
      throw error;
    }
  }

  async findByCustomerId(customerId: number): Promise<TripDetails[]> {
    const result = await query(
      `
      SELECT 
          t.*,
          v.license_plate,
          d.first_name as driver_first_name,
          d.last_name as driver_last_name
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE v.customer_id = $1
      ORDER BY t.start_time DESC
      `,
      [customerId]
    );
    return result.rows;
  }

  async getActiveTrip(vehicleId: number): Promise<Trip | null> {
    const result = await query(
      "SELECT * FROM trips WHERE vehicle_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1",
      [vehicleId]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async endTrip(id: number, endTime: Date): Promise<Trip | null> {
    const result = await query(
      "UPDATE trips SET end_time = $1 WHERE id = $2 RETURNING *",
      [endTime, id]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async findByVehicleId(vehicleId: number): Promise<Trip[]> {
    const result = await query(
      "SELECT * FROM trips WHERE vehicle_id = $1 ORDER BY start_time DESC",
      [vehicleId]
    );
    return result.rows;
  }

  async belongsToCustomer(
    tripId: number,
    customerId: number
  ): Promise<boolean> {
    const result = await query(
      `
      SELECT t.id 
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = $1 AND v.customer_id = $2
      `,
      [tripId, customerId]
    );
    return result.rows.length > 0;
  }
}
