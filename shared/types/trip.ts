export interface Trip {
  id?: number;
  vehicle_id: number;
  driver_id: number;
  start_time: Date;
  end_time?: Date | null;
  distance?: number;
  created_at?: Date;
}

export interface TripInput {
  vehicle_id: number;
  driver_id: number;
  start_time: Date;
  end_time?: Date | null;
  distance?: number;
}

export interface TripDetails extends Trip {
  license_plate?: string;
  driver_first_name?: string;
  driver_last_name?: string;
}
