import {
  validateVehicle,
  validateDriver,
  validateCustomer,
  validatePosition,
  validateTrip,
} from "../../utils/validators";
import { VehicleInput } from "../../models/vehicle";
import { DriverInput } from "../../models/driver";
import { CustomerInput } from "../../models/customer";
import { PositionInput } from "../../models/position";
import { TripInput } from "../../models/trip";

describe("Validators", () => {
  describe("validateVehicle", () => {
    it("should validate valid vehicle data", () => {
      const vehicle = {
        license_plate: "ABC123",
        customer_id: 1,
      };

      const result = validateVehicle(vehicle);
      expect(result.error).toBeUndefined();
    });

    it("should reject missing license_plate", () => {
      const vehicle = {
        customer_id: 1,
      } as VehicleInput;

      const result = validateVehicle(vehicle);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("license_plate");
    });

    it("should reject invalid customer_id", () => {
      const vehicle = {
        license_plate: "ABC123",
        customer_id: 0, // Must be > 0
      };

      const result = validateVehicle(vehicle);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("customer_id");
    });
  });

  describe("validateDriver", () => {
    it("should validate valid driver data", () => {
      const driver = {
        first_name: "John",
        last_name: "Doe",
        customer_id: 1,
        vehicle_id: 1,
      };

      const result = validateDriver(driver);
      expect(result.error).toBeUndefined();
    });

    it("should allow null vehicle_id", () => {
      const driver = {
        first_name: "John",
        last_name: "Doe",
        customer_id: 1,
        vehicle_id: null,
      };

      const result = validateDriver(driver);
      expect(result.error).toBeUndefined();
    });

    it("should reject missing required fields", () => {
      const driver = {
        first_name: "John",
        // missing last_name
        customer_id: 1,
      } as DriverInput;

      const result = validateDriver(driver);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("last_name");
    });
  });

  describe("validateCustomer", () => {
    it("should validate valid customer data", () => {
      const customer = {
        name: "Acme Corp",
        email: "info@acme.com",
      };

      const result = validateCustomer(customer);
      expect(result.error).toBeUndefined();
    });

    it("should allow null or empty email", () => {
      // Using type assertion with unknown first to avoid type issues
      const customerWithNullEmail = {
        name: "Acme Corp",
        email: null,
      } as unknown as CustomerInput;

      const customerWithEmptyEmail = {
        name: "Acme Corp",
        email: "",
      };

      expect(validateCustomer(customerWithNullEmail).error).toBeUndefined();
      expect(validateCustomer(customerWithEmptyEmail).error).toBeUndefined();
    });

    it("should reject invalid email format", () => {
      const customer = {
        name: "Acme Corp",
        email: "not-an-email",
      };

      const result = validateCustomer(customer);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("email");
    });

    it("should reject missing name", () => {
      const customer = {
        email: "info@acme.com",
      } as CustomerInput;

      const result = validateCustomer(customer);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("name");
    });
  });

  describe("validatePosition", () => {
    it("should validate valid position data", () => {
      const position = {
        vehicle_id: 1,
        latitude: 40.7128,
        longitude: -74.006,
        speed: 35,
        ignition: true,
      };

      const result = validatePosition(position);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid latitude/longitude", () => {
      const invalidLatitude = {
        vehicle_id: 1,
        latitude: 100, // Out of range (max 90)
        longitude: -74.006,
      };

      const invalidLongitude = {
        vehicle_id: 1,
        latitude: 40.7128,
        longitude: -190, // Out of range (min -180)
      };

      expect(validatePosition(invalidLatitude).error).toBeDefined();
      expect(validatePosition(invalidLongitude).error).toBeDefined();
    });

    it("should reject missing required fields", () => {
      const missingLatitude = {
        vehicle_id: 1,
        longitude: -74.006,
      } as PositionInput;

      const result = validatePosition(missingLatitude);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("latitude");
    });
  });

  describe("validateTrip", () => {
    it("should validate valid trip data", () => {
      const trip = {
        vehicle_id: 1,
        driver_id: 1,
        start_time: new Date("2023-01-01T10:00:00Z"),
        end_time: new Date("2023-01-01T12:00:00Z"),
        distance: 50,
      };

      const result = validateTrip(trip);
      expect(result.error).toBeUndefined();
    });

    it("should allow null end_time", () => {
      const trip = {
        vehicle_id: 1,
        driver_id: 1,
        start_time: new Date("2023-01-01T10:00:00Z"),
        end_time: null,
      };

      const result = validateTrip(trip);
      expect(result.error).toBeUndefined();
    });

    it("should reject end_time before start_time", () => {
      const trip = {
        vehicle_id: 1,
        driver_id: 1,
        start_time: new Date("2023-01-01T12:00:00Z"),
        end_time: new Date("2023-01-01T10:00:00Z"), // Before start_time
      };

      const result = validateTrip(trip);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("end_time");
    });

    it("should reject negative distance", () => {
      const trip = {
        vehicle_id: 1,
        driver_id: 1,
        start_time: new Date("2023-01-01T10:00:00Z"),
        distance: -5, // Negative distance
      } as TripInput;

      const result = validateTrip(trip);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("distance");
    });
  });
});
