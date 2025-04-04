import { query } from "../db";
import { Customer, CustomerInput } from "../models/customer";
import logger from "../config/logger";

import { Repository } from "./baseRepository";

/**
 * Customer-specific repository interface that extends the base repository
 */
export interface CustomerRepository
  extends Repository<Customer, number, CustomerInput> {
  /**
   * Find a customer by email
   * @param email Customer email
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Get counts of resources (vehicles, drivers) for a customer
   * @param id Customer ID
   */
  getResourceCounts(
    id: number
  ): Promise<{ vehicle_count: number; driver_count: number }>;
}

export class PostgresCustomerRepository implements CustomerRepository {
  async findAll(): Promise<Customer[]> {
    const result = await query(
      "SELECT * FROM customers ORDER BY name",
      [],
      "customer",
      "findAll"
    );
    return result.rows;
  }

  async findById(id: number): Promise<Customer | null> {
    const result = await query(
      "SELECT * FROM customers WHERE id = $1",
      [id],
      "customer",
      "findById"
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await query(
      "SELECT * FROM customers WHERE email = $1",
      [email],
      "customer",
      "findByEmail"
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async create(data: CustomerInput): Promise<Customer> {
    const result = await query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *",
      [data.name, data.email],
      "customer",
      "create"
    );
    return result.rows[0];
  }

  async update(id: number, data: CustomerInput): Promise<Customer | null> {
    const result = await query(
      "UPDATE customers SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [data.name, data.email, id],
      "customer",
      "update"
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id],
      "customer",
      "delete"
    );
    return result.rows.length > 0;
  }

  async getResourceCounts(
    id: number
  ): Promise<{ vehicle_count: number; driver_count: number }> {
    const result = await query(
      `
      SELECT 
          (SELECT COUNT(*) FROM vehicles WHERE customer_id = $1) as vehicle_count,
          (SELECT COUNT(*) FROM drivers WHERE customer_id = $1) as driver_count
      `,
      [id],
      "customer",
      "getResourceCounts"
    );
    return result.rows[0];
  }
}
