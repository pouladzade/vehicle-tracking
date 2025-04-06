import { query } from "../db";
import { Position, PositionInput, VehiclePosition } from "../models/position";
import logger from "../config/logger";

import { Repository } from "./baseRepository";

/**
 * Position-specific repository interface that extends the base repository
 */
export interface PositionRepository
  extends Repository<Position, number, PositionInput> {
  /**
   * Get current positions for all vehicles belonging to a customer
   * @param customerId Customer ID
   */
  getCurrentPositionsByCustomerId(
    customerId: number
  ): Promise<VehiclePosition[]>;

  /**
   * Get the last position for a vehicle
   * @param vehicleId Vehicle ID
   */
  getLastPosition(vehicleId: number): Promise<Position | null>;

  /**
   * Get positions before a specific timestamp
   * @param vehicleId Vehicle ID
   * @param timestamp Timestamp
   */
  getPositionsBefore(
    vehicleId: number,
    timestamp: Date
  ): Promise<Position | null>;

  /**
   * Get positions for a specific vehicle with limit
   * @param vehicleId Vehicle ID
   * @param limit Maximum number of records to return
   */
  getPositionsByVehicleId(
    vehicleId: number,
    limit?: number
  ): Promise<Position[]>;
}

export class PostgresPositionRepository implements PositionRepository {
  async findAll(): Promise<Position[]> {
    const result = await query(
      "SELECT * FROM vehicle_positions ORDER BY timestamp DESC"
    );
    return result.rows;
  }

  async findById(id: number): Promise<Position | null> {
    const result = await query(
      "SELECT * FROM vehicle_positions WHERE id = $1",
      [id]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async create(data: PositionInput): Promise<Position> {
    const result = await query(
      "INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        data.vehicle_id,
        data.latitude,
        data.longitude,
        data.speed,
        data.ignition,
      ]
    );
    return result.rows[0];
  }

  async update(id: number, data: PositionInput): Promise<Position | null> {
    const result = await query(
      "UPDATE vehicle_positions SET vehicle_id = $1, latitude = $2, longitude = $3, speed = $4, ignition = $5 WHERE id = $6 RETURNING *",
      [
        data.vehicle_id,
        data.latitude,
        data.longitude,
        data.speed,
        data.ignition,
        id,
      ]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM vehicle_positions WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error("Error deleting position:", error);
      throw error;
    }
  }

  async getCurrentPositionsByCustomerId(
    customerId: number
  ): Promise<VehiclePosition[]> {
    const result = await query(
      `
      SELECT vp.*, v.license_plate
      FROM vehicle_positions vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      WHERE v.customer_id = $1
      AND vp.timestamp = (
          SELECT MAX(timestamp) 
          FROM vehicle_positions 
          WHERE vehicle_id = vp.vehicle_id
      )
      ORDER BY vp.timestamp DESC
    `,
      [customerId]
    );
    return result.rows;
  }

  async getLastPosition(vehicleId: number): Promise<Position | null> {
    const result = await query(
      "SELECT * FROM vehicle_positions WHERE vehicle_id = $1 ORDER BY timestamp DESC LIMIT 1",
      [vehicleId]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async getPositionsBefore(
    vehicleId: number,
    timestamp: Date
  ): Promise<Position | null> {
    const result = await query(
      "SELECT * FROM vehicle_positions WHERE vehicle_id = $1 AND timestamp < $2 ORDER BY timestamp DESC LIMIT 1",
      [vehicleId, timestamp]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async getPositionsByVehicleId(
    vehicleId: number,
    limit: number = 100
  ): Promise<Position[]> {
    const result = await query(
      "SELECT * FROM vehicle_positions WHERE vehicle_id = $1 ORDER BY timestamp DESC LIMIT $2",
      [vehicleId, limit]
    );
    return result.rows;
  }
}
