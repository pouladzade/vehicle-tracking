import express from "express";

import {
  getAllVehicles,
  getVehicle,
  addVehicle,
  updateVehicleById,
  deleteVehicleById,
} from "../controllers/vehicleController";
import { checkVehicleOwnership } from "../middleware/auth";
import { validateVehicleMiddleware } from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles for the authenticated customer
 *     tags: [Vehicles]
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: A list of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.get("/", getAllVehicles);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vehicle ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Details of the vehicle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.get("/:id", checkVehicleOwnership, getVehicle);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - license_plate
 *             properties:
 *               license_plate:
 *                 type: string
 *                 example: "ABC123"
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.post("/", validateVehicleMiddleware, addVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vehicle ID
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               license_plate:
 *                 type: string
 *                 example: "XYZ789"
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  checkVehicleOwnership,
  validateVehicleMiddleware,
  updateVehicleById
);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vehicle ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", checkVehicleOwnership, deleteVehicleById);

export default router;
