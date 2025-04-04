export interface Driver {
  id?: number;
  first_name: string;
  last_name: string;
  customer_id: number;
  vehicle_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface DriverInput {
  first_name: string;
  last_name: string;
  customer_id: number;
  vehicle_id?: number | null;
}
