import { Customer } from "../models/customer";
import { RepositoryFactory } from "./index";

/**
 * Auth-specific repository interface for authentication operations
 */
export interface AuthRepository {
  /**
   * Authenticate a customer by ID
   * @param customerId Customer ID
   */
  authenticateById(customerId: number): Promise<Customer | null>;

  /**
   * Authenticate a customer by email
   * @param email Customer email
   */
  authenticateByEmail(email: string): Promise<Customer | null>;
}

export class PostgresAuthRepository implements AuthRepository {
  async authenticateById(customerId: number): Promise<Customer | null> {
    const customerRepository = RepositoryFactory.getCustomerRepository();
    return customerRepository.findById(customerId);
  }

  async authenticateByEmail(email: string): Promise<Customer | null> {
    const customerRepository = RepositoryFactory.getCustomerRepository();
    return customerRepository.findByEmail(email);
  }
}
