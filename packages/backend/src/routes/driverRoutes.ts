import express from "express";

import {
  getAllDrivers,
  getDriver,
  addDriver,
  updateDriverById,
  deleteDriverById,
} from "../controllers/driverController";
import { checkDriverOwnership } from "../middleware/auth";
import { validateDriverMiddleware } from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Get all drivers for the authenticated customer
 *     tags: [Drivers]
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: A list of drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.get("/", getAllDrivers);

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Get a driver by ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The driver ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Details of the driver
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
router.get("/:id", checkDriverOwnership, getDriver);

/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Drivers]
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               vehicle_id:
 *                 type: integer
 *                 example: 1
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Driver created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       500:
 *         description: Server error
 */
router.post("/", validateDriverMiddleware, addDriver);

/**
 * @swagger
 * /drivers/{id}:
 *   put:
 *     summary: Update a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The driver ID
 *     security:
 *       - CustomerID: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Jane"
 *               last_name:
 *                 type: string
 *                 example: "Smith"
 *               vehicle_id:
 *                 type: integer
 *                 example: 2
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Driver updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  checkDriverOwnership,
  validateDriverMiddleware,
  updateDriverById
);

/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     summary: Delete a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The driver ID
 *     security:
 *       - CustomerID: []
 *     responses:
 *       200:
 *         description: Driver deleted successfully
 *       401:
 *         description: Unauthorized - Customer ID is required
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", checkDriverOwnership, deleteDriverById);

export default router;
