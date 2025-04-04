import express from "express";
import { authController } from "../controllers";

const router = express.Router();

// Login with customer ID
router.post("/login", authController.authenticate);

export default router;
