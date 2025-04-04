import {
  VehicleRepository,
  PostgresVehicleRepository,
} from "./vehicleRepository";

import { DriverRepository, PostgresDriverRepository } from "./driverRepository";

import {
  CustomerRepository,
  PostgresCustomerRepository,
} from "./customerRepository";

import { AuthRepository, PostgresAuthRepository } from "./authRepository";

import {
  PositionRepository,
  PostgresPositionRepository,
} from "./positionRepository";

import { TripRepository, PostgresTripRepository } from "./tripRepository";

/**
 * Repository factory that creates instances of repositories
 * This makes it easier to inject repositories and switch implementations
 */
export class RepositoryFactory {
  private static vehicleRepository: VehicleRepository;
  private static driverRepository: DriverRepository;
  private static customerRepository: CustomerRepository;
  private static authRepository: AuthRepository;
  private static positionRepository: PositionRepository;
  private static tripRepository: TripRepository;

  /**
   * Get the vehicle repository instance
   * @returns A VehicleRepository instance
   */
  static getVehicleRepository(): VehicleRepository {
    if (!this.vehicleRepository) {
      this.vehicleRepository = new PostgresVehicleRepository();
    }
    return this.vehicleRepository;
  }

  /**
   * Set a custom vehicle repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setVehicleRepository(repository: VehicleRepository): void {
    this.vehicleRepository = repository;
  }

  /**
   * Get the driver repository instance
   * @returns A DriverRepository instance
   */
  static getDriverRepository(): DriverRepository {
    if (!this.driverRepository) {
      this.driverRepository = new PostgresDriverRepository();
    }
    return this.driverRepository;
  }

  /**
   * Set a custom driver repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setDriverRepository(repository: DriverRepository): void {
    this.driverRepository = repository;
  }

  /**
   * Get the customer repository instance
   * @returns A CustomerRepository instance
   */
  static getCustomerRepository(): CustomerRepository {
    if (!this.customerRepository) {
      this.customerRepository = new PostgresCustomerRepository();
    }
    return this.customerRepository;
  }

  /**
   * Set a custom customer repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setCustomerRepository(repository: CustomerRepository): void {
    this.customerRepository = repository;
  }

  /**
   * Get the auth repository instance
   * @returns An AuthRepository instance
   */
  static getAuthRepository(): AuthRepository {
    if (!this.authRepository) {
      this.authRepository = new PostgresAuthRepository();
    }
    return this.authRepository;
  }

  /**
   * Set a custom auth repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setAuthRepository(repository: AuthRepository): void {
    this.authRepository = repository;
  }

  /**
   * Get the position repository instance
   * @returns A PositionRepository instance
   */
  static getPositionRepository(): PositionRepository {
    if (!this.positionRepository) {
      this.positionRepository = new PostgresPositionRepository();
    }
    return this.positionRepository;
  }

  /**
   * Set a custom position repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setPositionRepository(repository: PositionRepository): void {
    this.positionRepository = repository;
  }

  /**
   * Get the trip repository instance
   * @returns A TripRepository instance
   */
  static getTripRepository(): TripRepository {
    if (!this.tripRepository) {
      this.tripRepository = new PostgresTripRepository();
    }
    return this.tripRepository;
  }

  /**
   * Set a custom trip repository implementation
   * Useful for testing with mock repositories
   * @param repository The repository implementation to use
   */
  static setTripRepository(repository: TripRepository): void {
    this.tripRepository = repository;
  }
}
