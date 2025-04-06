/**
 * @swagger
 * components:
 *   schemas:
 *     Position:
 *       type: object
 *       required:
 *         - vehicle_id
 *         - latitude
 *         - longitude
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the position
 *         vehicle_id:
 *           type: integer
 *           description: ID of the vehicle this position belongs to
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitude coordinate
 *         speed:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Speed in km/h
 *         timestamp:
 *           format: float
 *           nullable: true
 *           description: Altitude in meters
 *         accuracy:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Accuracy in meters
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Time when position was recorded
 *         ignition:
 *           type: boolean
 *           nullable: true
 *           description: Whether the ignition is on or off
 *       example:
 *         id: 1
 *         vehicle_id: 1
 *         latitude: 40.7128
 *         longitude: -74.0060
 *         speed: 45.5
 *         heading: 90
 *         altitude: 50
 *         accuracy: 5
 *         timestamp: "2023-01-01T12:30:00.000Z"
 *         ignition: true
 *
 *     VehiclePosition:
 *       allOf:
 *         - $ref: '#/components/schemas/Position'
 *         - type: object
 *           properties:
 *             license_plate:
 *               type: string
 *               description: License plate of the vehicle
 *             vehicle_make:
 *               type: string
 *               description: Make of the vehicle
 *             vehicle_model:
 *               type: string
 *               description: Model of the vehicle
 */

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
