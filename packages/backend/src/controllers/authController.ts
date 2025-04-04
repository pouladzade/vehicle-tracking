import { Request, Response } from "express";

import logger from "../config/logger";
import { RepositoryFactory } from "../repositories";
import {
  ValidationError,
  AuthenticationError,
  ServerError,
  ErrorCode,
  sendErrorResponse,
} from "../utils/errors";

// Get the repository from the factory
const authRepository = RepositoryFactory.getAuthRepository();

export const authenticate = async (req: Request, res: Response) => {
  try {
    const { customerId, email } = req.body;

    // Check if either customerId or email is provided
    if (!customerId && !email) {
      throw new ValidationError(
        "Customer ID or email is required",
        ErrorCode.MISSING_FIELD,
        {
          fields: {
            customerId: "Required if email not provided",
            email: "Required if customer ID not provided",
          },
        }
      );
    }

    let customer = null;

    // Try to authenticate with customer ID if provided
    if (customerId) {
      customer = await authRepository.authenticateById(Number(customerId));
      if (!customer) {
        throw new AuthenticationError(
          "Invalid customer ID",
          ErrorCode.INVALID_CREDENTIALS,
          { customerId }
        );
      }
    }
    // Try to authenticate with email if provided
    else if (email) {
      customer = await authRepository.authenticateByEmail(email);
      if (!customer) {
        throw new AuthenticationError(
          "Invalid email address",
          ErrorCode.INVALID_CREDENTIALS,
          { email }
        );
      }
    }

    // In a real application, you would use JWT or another authentication mechanism
    // For this simple example, we just return the customer ID
    res.json({
      success: true,
      data: {
        customerId: customer!.id,
      },
      message: "Authentication successful",
    });
  } catch (error: any) {
    logger.error("Authentication error:", error);
    sendErrorResponse(res, error, req);
  }
};
