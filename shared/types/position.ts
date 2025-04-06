export interface Position {
  id?: number;
  vehicle_id: number;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: Date;
  ignition?: boolean;
}

export interface PositionInput {
  vehicle_id: number;
  latitude: number;
  longitude: number;
  speed?: number;
  ignition?: boolean;
}

export interface VehiclePosition extends Position {
  license_plate?: string;
}
