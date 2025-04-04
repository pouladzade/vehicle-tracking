/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       required:
 *         - vehicle_id
 *         - driver_id
 *         - start_time
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the trip
 *         vehicle_id:
 *           type: integer
 *           description: ID of the vehicle used for this trip
 *         driver_id:
 *           type: integer
 *           description: ID of the driver operating the vehicle
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: When the trip started
 *         end_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the trip ended (null for active trips)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: 1
 *         vehicle_id: 1
 *         driver_id: 1
 *         start_time: "2023-01-01T10:00:00.000Z"
 *         end_time: "2023-01-01T12:00:00.000Z"
 *         created_at: "2023-01-01T09:55:00.000Z"
 *         updated_at: "2023-01-01T12:05:00.000Z"
 */

export interface Trip {
  id?: number;
  vehicle_id: number;
  driver_id: number;
  start_time: Date;
  end_time?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TripInput {
  vehicle_id: number;
  driver_id: number;
  start_time?: Date;
  end_time?: Date | null;
  distance?: number;
}

export interface TripDetails extends Trip {
  license_plate?: string;
  driver_first_name?: string;
  driver_last_name?: string;
}
