import { Request, Response } from "express";

import logger from "../config/logger";
import { CustomerInput } from "../models/customer";
import { RepositoryFactory } from "../repositories";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ServerError,
  ErrorCode,
  sendErrorResponse,
} from "../utils/errors";

// Get the repository from the factory
const customerRepository = RepositoryFactory.getCustomerRepository();

/**
 * Get all customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await customerRepository.findAll();
    res.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    logger.error("Error getting all customers:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError(
        "Invalid customer ID",
        ErrorCode.INVALID_INPUT,
        { param: "id" }
      );
    }

    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError(
        "Customer not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { customerId: id }
      );
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    logger.error("Error getting customer by ID:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CustomerInput = req.body;

    // Check if email is provided
    if (!customerData.email) {
      throw new ValidationError(
        "Email is required",
        ErrorCode.MISSING_REQUIRED_FIELD,
        { field: "email" }
      );
    }

    // Check if email is already in use
    const existingCustomer = await customerRepository.findByEmail(
      customerData.email
    );
    if (existingCustomer) {
      throw new ConflictError(
        "Email is already in use",
        ErrorCode.RESOURCE_ALREADY_EXISTS,
        { email: customerData.email }
      );
    }

    const customer = await customerRepository.create(customerData);
    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error: any) {
    logger.error("Error creating customer:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Update customer by ID
 */
export const updateCustomerById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError(
        "Invalid customer ID",
        ErrorCode.INVALID_INPUT,
        { param: "id" }
      );
    }

    const customerData: CustomerInput = req.body;

    // Check if email is already in use by another customer
    if (typeof customerData.email === "string") {
      const existingCustomer = await customerRepository.findByEmail(
        customerData.email
      );
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictError(
          "Email is already in use by another customer",
          ErrorCode.RESOURCE_CONFLICT,
          { email: customerData.email }
        );
      }
    }

    const customer = await customerRepository.update(id, customerData);
    if (!customer) {
      throw new NotFoundError(
        "Customer not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { customerId: id }
      );
    }

    res.json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error: any) {
    logger.error("Error updating customer:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Delete customer by ID
 */
export const deleteCustomerById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError(
        "Invalid customer ID",
        ErrorCode.INVALID_INPUT,
        { param: "id" }
      );
    }

    const success = await customerRepository.delete(id);
    if (!success) {
      throw new NotFoundError(
        "Customer not found",
        ErrorCode.RESOURCE_NOT_FOUND,
        { customerId: id }
      );
    }

    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting customer:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Validate customer ID exists
 */
export const validateCustomerId = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.body;

    if (!customerId || isNaN(Number(customerId))) {
      throw new ValidationError(
        "Valid customer ID is required",
        ErrorCode.INVALID_INPUT,
        { param: "customerId" }
      );
    }

    const customer = await customerRepository.findById(Number(customerId));

    res.json({
      success: true,
      data: {
        valid: !!customer,
        customerId: customer ? customer.id : null,
      },
    });
  } catch (error: any) {
    logger.error("Error validating customer ID:", error);
    sendErrorResponse(res, error, req);
  }
};

/**
 * Validate customer email exists
 */
export const validateCustomerEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new ValidationError(
        "Valid email address is required",
        ErrorCode.INVALID_FORMAT,
        { param: "email" }
      );
    }

    const customer = await customerRepository.findByEmail(email);

    res.json({
      success: true,
      data: {
        valid: !!customer,
        customerId: customer ? customer.id : null,
      },
    });
  } catch (error: any) {
    logger.error("Error validating customer email:", error);
    sendErrorResponse(res, error, req);
  }
};
