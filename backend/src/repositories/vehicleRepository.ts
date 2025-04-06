import { query } from "../db";
import { Vehicle, VehicleInput } from "../models/vehicle";
import logger from "../config/logger";

import { Repository } from "./baseRepository";
import { RepositoryFactory } from "./index";

/**
 * Vehicle-specific repository interface that extends the base repository
 */
export interface VehicleRepository
  extends Repository<Vehicle, number, VehicleInput> {
  /**
   * Find all vehicles belonging to a specific customer
   * @param customerId Customer ID
   */
  findByCustomerId(customerId: number): Promise<Vehicle[]>;

  /**
   * Check if a vehicle belongs to a customer
   * @param vehicleId Vehicle ID
   * @param customerId Customer ID
   */
  belongsToCustomer(vehicleId: number, customerId: number): Promise<boolean>;

  /**
   * Check if a vehicle has associated trips
   * @param vehicleId Vehicle ID
   */
  hasAssociatedTrips(vehicleId: number): Promise<boolean>;

  /**
   * Check if a vehicle has position records
   * @param vehicleId Vehicle ID
   */
  hasPositions(vehicleId: number): Promise<boolean>;

  /**
   * Delete all positions for a vehicle
   * @param vehicleId Vehicle ID
   */
  deleteVehiclePositions(vehicleId: number): Promise<void>;
}

export class PostgresVehicleRepository implements VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const result = await query(
      "SELECT * FROM vehicles ORDER BY license_plate",
      [],
      "vehicle",
      "findAll"
    );
    return result.rows;
  }

  async findByCustomerId(customerId: number): Promise<Vehicle[]> {
    const result = await query(
      "SELECT * FROM vehicles WHERE customer_id = $1",
      [customerId],
      "vehicle",
      "findByCustomerId"
    );
    return result.rows;
  }

  async findById(id: number): Promise<Vehicle | null> {
    const result = await query(
      "SELECT * FROM vehicles WHERE id = $1",
      [id],
      "vehicle",
      "findById"
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async create(data: VehicleInput): Promise<Vehicle> {
    const result = await query(
      "INSERT INTO vehicles (license_plate, customer_id) VALUES ($1, $2) RETURNING *",
      [data.license_plate, data.customer_id],
      "vehicle",
      "create"
    );
    return result.rows[0];
  }

  async update(id: number, data: VehicleInput): Promise<Vehicle | null> {
    const result = await query(
      "UPDATE vehicles SET license_plate = $1, customer_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [data.license_plate, data.customer_id, id],
      "vehicle",
      "update"
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async hasAssociatedTrips(vehicleId: number): Promise<boolean> {
    const result = await query(
      "SELECT COUNT(*) FROM trips WHERE vehicle_id = $1",
      [vehicleId],
      "vehicle",
      "hasAssociatedTrips"
    );

    return parseInt(result.rows[0].count) > 0;
  }

  async hasPositions(vehicleId: number): Promise<boolean> {
    const result = await query(
      "SELECT COUNT(*) FROM vehicle_positions WHERE vehicle_id = $1",
      [vehicleId],
      "vehicle",
      "hasPositions"
    );

    return parseInt(result.rows[0].count) > 0;
  }

  async deleteVehiclePositions(vehicleId: number): Promise<void> {
    await query(
      "DELETE FROM vehicle_positions WHERE vehicle_id = $1",
      [vehicleId],
      "vehicle",
      "deleteVehiclePositions"
    );
  }

  async delete(id: number): Promise<boolean> {
    try {
      // First, check if the vehicle has associated trips
      const hasTrips = await this.hasAssociatedTrips(id);
      if (hasTrips) {
        throw new Error(
          "Cannot delete vehicle because it has associated trips. " +
            "Please delete the trips first before deleting this vehicle."
        );
      }

      // Check if the vehicle has positions
      const hasPositions = await this.hasPositions(id);
      if (hasPositions) {
        // Delete all position records for this vehicle
        await this.deleteVehiclePositions(id);
        logger.info(`Deleted all position records for vehicle ${id}`);
      }

      // Next, unassign any drivers associated with this vehicle
      const driverRepository = RepositoryFactory.getDriverRepository();
      await driverRepository.unassignFromVehicle(id);

      // Then delete the vehicle
      const result = await query(
        "DELETE FROM vehicles WHERE id = $1 RETURNING id",
        [id],
        "vehicle",
        "delete"
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error("Error deleting vehicle:", error);
      throw error;
    }
  }

  async belongsToCustomer(
    vehicleId: number,
    customerId: number
  ): Promise<boolean> {
    const result = await query(
      "SELECT id FROM vehicles WHERE id = $1 AND customer_id = $2",
      [vehicleId, customerId],
      "vehicle",
      "belongsToCustomer"
    );
    return result.rows.length > 0;
  }
}
