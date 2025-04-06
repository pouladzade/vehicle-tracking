import express from "express";
import * as customerController from "../controllers/customerController";
import { authenticateCustomer } from "../middleware/auth";

const router = express.Router();

// Get all customers
router.get("/", authenticateCustomer, customerController.getAllCustomers);

// Get customer by ID
router.get("/:id", authenticateCustomer, customerController.getCustomerById);

// Create a new customer
router.post("/", customerController.createCustomer);

// Update a customer
router.put("/:id", authenticateCustomer, customerController.updateCustomerById);

// Delete a customer
router.delete(
  "/:id",
  authenticateCustomer,
  customerController.deleteCustomerById
);

/**
 * @swagger
 * /customers/validate:
 *   post:
 *     summary: Validate a customer ID
 *     description: Used for login to check if a customer ID exists
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     customerId:
 *                       type: integer
 *                       nullable: true
 *       400:
 *         description: Invalid input - Customer ID is required
 *       500:
 *         description: Server error
 */
router.post("/validate", customerController.validateCustomerId);

/**
 * @swagger
 * /customers/validate-email:
 *   post:
 *     summary: Validate a customer email
 *     description: Used for login to check if a customer email exists
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@speedylogistics.com
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     customerId:
 *                       type: integer
 *                       nullable: true
 *       400:
 *         description: Invalid input - Email is required
 *       500:
 *         description: Server error
 */
router.post("/validate-email", customerController.validateCustomerEmail);

export default router;
