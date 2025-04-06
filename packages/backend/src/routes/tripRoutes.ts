import express from "express";

import {
  getAllTrips,
  getTrip,
  getVehicleTrips,
  addTrip,
  updateTripById,
  endTrip,
  deleteTripById,
} from "../controllers/tripController";
import { checkTripOwnership } from "../middleware/auth";
import { validateTripMiddleware } from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Get all trips for the authenticated customer
 *     tags: [Trips]
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: A list of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.get("/", getAllTrips);

/**
 * @swagger
 * /trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The trip ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Details of the trip
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.get("/:id", checkTripOwnership, getTrip);

// GET trips for a specific vehicle
router.get("/vehicle/:vehicleId", getVehicleTrips);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
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
 *               - driver_id
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 1
 *               driver_id:
 *                 type: integer
 *                 example: 1
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T10:00:00.000Z"
 *                 description: Start time of the trip (defaults to current time if not provided)
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T12:00:00.000Z"
 *                 description: End time of the trip (null for active trips)
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.post("/", validateTripMiddleware, addTrip);

/**
 * @swagger
 * /trips/{id}/end:
 *   post:
 *     summary: End a trip and calculate distance
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The trip ID to end
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Trip ended successfully with calculated distance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Trip already ended or invalid request
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       403:
 *         description: Access denied - trip does not belong to customer
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.post("/:id/end", checkTripOwnership, endTrip);

/**
 * @swagger
 * /trips/{id}:
 *   put:
 *     summary: Update a trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The trip ID
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 2
 *               driver_id:
 *                 type: integer
 *                 example: 2
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T09:30:00.000Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T13:00:00.000Z"
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.put("/:id", checkTripOwnership, validateTripMiddleware, updateTripById);

/**
 * @swagger
 * /trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The trip ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", checkTripOwnership, deleteTripById);

export default router;
