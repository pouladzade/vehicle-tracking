export interface Customer {
  id?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CustomerInput {
  name: string;
}
