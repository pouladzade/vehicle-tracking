// Export all types from model files
export * from "./customer";
export * from "./driver";
export * from "./vehicle";
export * from "./position";
export * from "./trip";

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Authentication types
export interface AuthUser {
  customerId: number;
}
