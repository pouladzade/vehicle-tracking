/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       required:
 *         - license_plate
 *         - customer_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the vehicle
 *         license_plate:
 *           type: string
 *           description: The vehicle's license plate
 *         customer_id:
 *           type: integer
 *           description: ID of the customer who owns this vehicle
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
 *         license_plate: "ABC123"
 *         customer_id: 1
 *         created_at: "2023-01-01T00:00:00.000Z"
 *         updated_at: "2023-01-01T00:00:00.000Z"
 */

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
