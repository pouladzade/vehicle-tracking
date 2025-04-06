import {
  Vehicle,
  Driver,
  Trip,
  TripDetails,
  Position,
  VehiclePosition,
  Customer,
  VehicleInput,
  DriverInput,
  TripInput,
  PositionInput,
} from "shared/types";
import { ApiErrorResponse } from "shared/types/api";

// API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Error codes
export enum ErrorCode {
  // Authentication errors (1000-1099)
  UNAUTHORIZED = 1000,
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,

  // Resource errors (1100-1199)
  RESOURCE_NOT_FOUND = 1100,
  RESOURCE_ALREADY_EXISTS = 1101,
  RESOURCE_CONFLICT = 1102,

  // Validation errors (1200-1299)
  VALIDATION_ERROR = 1200,
  INVALID_INPUT = 1201,
  MISSING_FIELD = 1202,
  INVALID_FORMAT = 1203,

  // Business logic errors (1300-1399)
  BUSINESS_RULE_VIOLATION = 1300,
  OPERATION_NOT_ALLOWED = 1301,

  // Database errors (1400-1499)
  DATABASE_ERROR = 1400,
  QUERY_FAILED = 1401,

  // Server errors (1500-1599)
  INTERNAL_ERROR = 1500,
  SERVICE_UNAVAILABLE = 1501,

  // Third-party service errors (1600-1699)
  EXTERNAL_SERVICE_ERROR = 1600,
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

console.log("API_BASE_URL:", API_BASE_URL);

/**
 * Error handler class for API errors
 */
export class ApiError extends Error {
  code: number;
  details?: any;
  path?: string;
  timestamp: string;

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.error.message);
    this.name = "ApiError";
    this.code = errorResponse.error.code;
    this.details = errorResponse.error.details;
    this.path = errorResponse.path;
    this.timestamp = errorResponse.timestamp;
  }

  /**
   * Check if the error is of a specific error type
   */
  isErrorType(errorCode: ErrorCode): boolean {
    return this.code === errorCode;
  }

  /**
   * Get a user-friendly message for common errors
   */
  getUserFriendlyMessage(): string {
    switch (this.code) {
      case ErrorCode.UNAUTHORIZED:
        return "Please log in to continue";
      case ErrorCode.INVALID_CREDENTIALS:
        return "Invalid login credentials";
      case ErrorCode.TOKEN_EXPIRED:
        return "Your session has expired. Please log in again";
      case ErrorCode.RESOURCE_NOT_FOUND:
        return "The requested resource could not be found";
      case ErrorCode.VALIDATION_ERROR:
        return this.message || "Please check your input and try again";
      case ErrorCode.INTERNAL_ERROR:
        return "Something went wrong. Please try again later";
      case ErrorCode.SERVICE_UNAVAILABLE:
        return "Service is temporarily unavailable. Please try again later";
      default:
        return this.message;
    }
  }

  /**
   * Get validation errors for form fields
   */
  getFieldErrors(): Record<string, string> | null {
    if (this.code === ErrorCode.VALIDATION_ERROR && this.details?.fields) {
      return this.details.fields;
    }
    return null;
  }
}

/**
 * Generic fetch function with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Set up base headers
    const customHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      const customerId = localStorage.getItem("customerId");
      console.log(
        `API Request: ${endpoint}, CustomerID from localStorage:`,
        customerId
      );

      if (customerId) {
        console.log(`Setting X-Customer-ID header to ${customerId}`);
        customHeaders["X-Customer-ID"] = customerId;
      } else {
        console.warn(
          `No customerId found in localStorage for request to ${endpoint}`
        );
      }
    }

    // Log the full request details for debugging
    console.log(`API Request: ${API_BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: customHeaders,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: customHeaders,
    });

    // Log the response status
    console.log(`API Response status: ${response.status} for ${endpoint}`);

    // Get the response data
    const responseText = await response.text();

    // Try to parse the response as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log(`API Raw response data for ${endpoint}:`, data);
    } catch (e) {
      console.error("Failed to parse response as JSON:", responseText);
      throw new Error("Invalid JSON response");
    }

    // Check if the response has the expected structure
    if (!response.ok) {
      // If the response has the standardized error format
      if (data && !data.success && data.error?.code) {
        console.error("API Error:", data);
        throw new ApiError(data as ApiErrorResponse);
      }

      // Fallback for non-standardized error responses
      console.error("Non-standard API Error:", data);
      throw new Error(
        data.message ||
          data.error ||
          `API request failed with status ${response.status}`
      );
    }

    // Handle the case where data is null or undefined
    if (data === null || data === undefined) {
      console.warn(`API Response for ${endpoint} is null or undefined`);
      throw new Error("No data returned from API");
    }

    // The backend returns responses in the format { success: true, data: {...} }
    if (data.success === true && "data" in data) {
      return data as ApiResponse<T>;
    }

    // For backward compatibility with older API responses
    return {
      success: true,
      data: data as T,
      message: "Success",
    };
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);

    // If it's already an ApiError, just throw it
    if (error instanceof ApiError) {
      throw error;
    }

    // For other types of errors, create a generic error response
    return {
      success: false,
      data: null as unknown as T,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>;
  }
}

// Helper function to handle API errors in components
export async function handleApiRequest<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: ApiError) => void
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const response = await apiCall();

    if (response.success && "data" in response) {
      if (onSuccess) onSuccess(response.data);
      return { data: response.data };
    } else {
      // This should not happen since non-success should throw an ApiError
      const apiError = new ApiError({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Unknown error format in response",
        },
        timestamp: new Date().toISOString(),
      });

      if (onError) onError(apiError);
      return { error: apiError };
    }
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({
            success: false,
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: error instanceof Error ? error.message : "Unknown error",
            },
            timestamp: new Date().toISOString(),
          });

    if (onError) onError(apiError);
    return { error: apiError };
  }
}

// Vehicles API
export const vehiclesApi = {
  getAll: () => fetchApi<Vehicle[]>("/vehicles"),
  getById: (id: number) => fetchApi<Vehicle>(`/vehicles/${id}`),
  create: (data: VehicleInput) =>
    fetchApi<Vehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: VehicleInput) =>
    fetchApi<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/vehicles/${id}`, {
      method: "DELETE",
    }),
};

// Drivers API
export const driversApi = {
  getAll: () => fetchApi<Driver[]>("/drivers"),
  getById: (id: number) => fetchApi<Driver>(`/drivers/${id}`),
  create: (data: DriverInput) =>
    fetchApi<Driver>("/drivers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: DriverInput) =>
    fetchApi<Driver>(`/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/drivers/${id}`, {
      method: "DELETE",
    }),
};

// Trips API
export const tripsApi = {
  getAll: () => fetchApi<TripDetails[]>("/trips"),
  getById: (id: number) => fetchApi<TripDetails>(`/trips/${id}`),
  create: (data: TripInput) =>
    fetchApi<Trip>("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: TripInput) =>
    fetchApi<Trip>(`/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/trips/${id}`, {
      method: "DELETE",
    }),
  endTrip: (id: number) =>
    fetchApi<Trip>(`/trips/${id}/end`, {
      method: "POST",
    }),
};

// Positions API
export const positionsApi = {
  getAll: () => fetchApi<VehiclePosition[]>("/positions"),
  getByVehicleId: (vehicleId: number) =>
    fetchApi<Position[]>(`/positions/vehicle/${vehicleId}`),
  async getLatestByVehicleId(vehicleId: number) {
    // Track the specific reason for failure
    let failureReason = "Unknown error";

    try {
      console.log(`getLatestByVehicleId called with:`, {
        vehicleId,
        typeOfId: typeof vehicleId,
        isNaN: isNaN(vehicleId),
      });

      if (!vehicleId || isNaN(vehicleId)) {
        failureReason = `Invalid vehicle ID: ${vehicleId} (${typeof vehicleId})`;
        console.error(failureReason);
        return {
          success: false,
          message: failureReason,
        };
      }

      // Ensure vehicleId is a number
      const numericVehicleId = Number(vehicleId);

      // Get customerId from localStorage
      const customerId = localStorage.getItem("customerId");
      console.log(`Customer ID from localStorage:`, {
        customerId,
        exists: !!customerId,
      });

      if (!customerId) {
        failureReason = "No customerId found in localStorage";
        console.warn(failureReason);
        return { success: false, message: failureReason };
      }

      // Create the URL and logging
      const url = `${API_BASE_URL}/positions/vehicle/${numericVehicleId}/latest`;
      console.log(`Making position API request to: ${url}`);
      console.log(`Headers: X-Customer-ID: ${customerId}`);

      // Make the request with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          headers: {
            "X-Customer-ID": customerId,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`Position API response status: ${response.status}`);

        if (!response.ok) {
          failureReason = `API returned status ${response.status}`;
          console.warn(failureReason);
          return {
            success: false,
            message: failureReason,
          };
        }

        const text = await response.text();
        console.log(
          `Raw response text (first 100 chars): ${text?.substring(0, 100)}${
            text?.length > 100 ? "..." : ""
          }`
        );

        // Check if the response is empty
        if (!text) {
          failureReason = "Empty response from API";
          console.warn(failureReason);
          return { success: false, message: failureReason };
        }

        // Try to parse the JSON
        try {
          const data = JSON.parse(text);

          // Check if data structure is correct
          if (!data) {
            failureReason = "Parsed response is null or undefined";
            console.error(failureReason);
            return { success: false, message: failureReason };
          }

          // Check if we have a data property
          if (!data.data) {
            failureReason = "Response missing data property";
            console.error(failureReason, data);
            return { success: false, message: failureReason };
          }

          // Debug logging
          console.log(
            `API Response for vehicle ${numericVehicleId} position success:`,
            {
              status: response.status,
              success: true,
              hasData: !!data.data,
              data: data.data,
            }
          );

          return {
            success: true,
            data: data.data,
          };
        } catch (parseError) {
          failureReason = "Failed to parse response as JSON";
          console.error(failureReason, parseError);
          console.error("Raw response:", text);
          return {
            success: false,
            message: failureReason,
          };
        }
      } catch (fetchError: any) {
        if (fetchError.name === "AbortError") {
          failureReason = "Request timed out after 10 seconds";
        } else {
          failureReason = `Fetch error: ${
            fetchError.message || String(fetchError)
          }`;
        }
        console.error(failureReason, fetchError);
        return { success: false, message: failureReason };
      }
    } catch (error) {
      failureReason = `Unexpected error: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error("Error fetching latest position:", failureReason);
      return { success: false, message: failureReason };
    }
  },
  create: (data: PositionInput) =>
    fetchApi<Position>("/positions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Auth API
export const authApi = {
  login: (customerId: number) =>
    fetchApi<{ customerId: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ customerId }),
    }),

  loginWithEmail: (email: string) =>
    fetchApi<{ customerId: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  validateCustomer: (customerId: number) =>
    fetchApi<{ valid: boolean; customerId: number | null }>(
      "/customers/validate",
      {
        method: "POST",
        body: JSON.stringify({ customerId }),
      }
    ),

  validateCustomerEmail: (email: string) =>
    fetchApi<{ valid: boolean; customerId: number | null }>(
      "/customers/validate-email",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    ),
};

// Customers API
export const customersApi = {
  create: (data: { name: string; email: string }) =>
    fetchApi<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
