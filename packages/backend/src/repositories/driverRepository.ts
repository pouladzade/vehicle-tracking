import { query } from "../db";
import { Driver, DriverInput } from "../models/driver";
import logger from "../config/logger";

import { Repository } from "./baseRepository";

/**
 * Driver-specific repository interface that extends the base repository
 */
export interface DriverRepository
  extends Repository<Driver, number, DriverInput> {
  /**
   * Find all drivers belonging to a specific customer
   * @param customerId Customer ID
   */
  findByCustomerId(customerId: number): Promise<Driver[]>;

  /**
   * Check if a driver belongs to a customer
   * @param driverId Driver ID
   * @param customerId Customer ID
   */
  belongsToCustomer(driverId: number, customerId: number): Promise<boolean>;

  /**
   * Get driver by vehicle ID
   * @param vehicleId Vehicle ID
   */
  findByVehicleId(vehicleId: number): Promise<Driver | null>;

  /**
   * Get all drivers assigned to a vehicle
   * @param vehicleId Vehicle ID
   */
  findAllByVehicleId(vehicleId: number): Promise<Driver[]>;

  /**
   * Unassign all drivers from a vehicle
   * @param vehicleId Vehicle ID
   */
  unassignFromVehicle(vehicleId: number): Promise<boolean>;
}

export class PostgresDriverRepository implements DriverRepository {
  async findAll(): Promise<Driver[]> {
    const result = await query(
      "SELECT * FROM drivers ORDER BY last_name, first_name"
    );
    return result.rows;
  }

  async findByCustomerId(customerId: number): Promise<Driver[]> {
    const result = await query("SELECT * FROM drivers WHERE customer_id = $1", [
      customerId,
    ]);
    return result.rows;
  }

  async findById(id: number): Promise<Driver | null> {
    const result = await query("SELECT * FROM drivers WHERE id = $1", [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  async create(data: DriverInput): Promise<Driver> {
    const result = await query(
      "INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.first_name, data.last_name, data.customer_id, data.vehicle_id]
    );
    return result.rows[0];
  }

  async update(id: number, data: DriverInput): Promise<Driver | null> {
    const result = await query(
      "UPDATE drivers SET first_name = $1, last_name = $2, customer_id = $3, vehicle_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [data.first_name, data.last_name, data.customer_id, data.vehicle_id, id]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM drivers WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error("Error deleting driver:", error);
      throw error;
    }
  }

  async belongsToCustomer(
    driverId: number,
    customerId: number
  ): Promise<boolean> {
    const result = await query(
      "SELECT id FROM drivers WHERE id = $1 AND customer_id = $2",
      [driverId, customerId]
    );
    return result.rows.length > 0;
  }

  async findByVehicleId(vehicleId: number): Promise<Driver | null> {
    const result = await query(
      "SELECT * FROM drivers WHERE vehicle_id = $1 ORDER BY updated_at DESC LIMIT 1",
      [vehicleId]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async findAllByVehicleId(vehicleId: number): Promise<Driver[]> {
    const result = await query("SELECT * FROM drivers WHERE vehicle_id = $1", [
      vehicleId,
    ]);
    return result.rows;
  }

  async unassignFromVehicle(vehicleId: number): Promise<boolean> {
    await query(
      "UPDATE drivers SET vehicle_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE vehicle_id = $1",
      [vehicleId]
    );
    return true;
  }
}
