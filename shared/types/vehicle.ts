export interface Vehicle {
  id?: number;
  license_plate: string;
  customer_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface VehicleInput {
  license_plate: string;
  customer_id: number;
}
