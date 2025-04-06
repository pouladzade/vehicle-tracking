/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - customer_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the driver
 *         first_name:
 *           type: string
 *           description: The driver's first name
 *         last_name:
 *           type: string
 *           description: The driver's last name
 *         customer_id:
 *           type: integer
 *           description: ID of the customer who employs this driver
 *         vehicle_id:
 *           type: integer
 *           nullable: true
 *           description: ID of the vehicle assigned to this driver (optional)
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
 *         first_name: "John"
 *         last_name: "Doe"
 *         customer_id: 1
 *         vehicle_id: 1
 *         created_at: "2023-01-01T00:00:00.000Z"
 *         updated_at: "2023-01-01T00:00:00.000Z"
 */

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
