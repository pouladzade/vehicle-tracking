import express from "express";
import * as positionController from "../controllers/positionController";
import { checkVehicleOwnershipByVehicleId } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /positions:
 *   get:
 *     summary: Get all positions for the authenticated customer
 *     tags: [Positions]
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: A list of positions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Position'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.get("/", positionController.getAllPositions);

/**
 * @swagger
 * /positions/vehicle/{vehicleId}:
 *   get:
 *     summary: Get positions for a specific vehicle
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vehicle ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: List of positions for the vehicle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Position'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.get(
  "/vehicle/:vehicleId",
  checkVehicleOwnershipByVehicleId,
  positionController.getVehiclePositions
);

/**
 * @swagger
 * /positions/vehicle/{vehicleId}/latest:
 *   get:
 *     summary: Get the latest position for a specific vehicle
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vehicle ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: The latest position for the vehicle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Vehicle not found or no positions available
 *       500:
 *         description: Server error
 */
router.get(
  "/vehicle/:vehicleId/latest",
  checkVehicleOwnershipByVehicleId,
  positionController.getLatestVehiclePosition
);

/**
 * @swagger
 * /positions:
 *   post:
 *     summary: Add a new position record
 *     tags: [Positions]
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - latitude
 *               - longitude
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 1
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -74.0060
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T12:30:00.000Z"
 *                 description: Time of the position reading (defaults to current time if not provided)
 *     responses:
 *       201:
 *         description: Position record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.post("/", positionController.createPosition);

export default router;
