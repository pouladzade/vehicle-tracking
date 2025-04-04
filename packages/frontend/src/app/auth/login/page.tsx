"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, handleApiRequest, ApiError } from "@/services/api";
import { ErrorMessage } from "@/components/ErrorHandler";

export default function LoginPage() {
  const [customerId, setCustomerId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check what the user provided
      const isUsingEmail = email && email.includes("@");
      const isUsingId = customerId && !isNaN(parseInt(customerId));

      // Validate input
      if (!isUsingEmail && !isUsingId) {
        const validationError = new ApiError({
          success: false,
          error: {
            code: 1201, // ErrorCode.INVALID_INPUT
            message: "Please enter either a valid customer ID or email address",
            details: {
              fields: {
                customerId: "Required if email not provided",
                email: "Required if customer ID not provided",
              },
            },
          },
          timestamp: new Date().toISOString(),
        });
        setError(validationError);
        setLoading(false);
        return;
      }

      // Determine login method and handle login
      if (isUsingId) {
        console.log("Logging in with customer ID:", customerId);
        await handleApiRequest(
          () => authApi.login(parseInt(customerId)),
          (data) => {
            const customerIdFromResponse = data.customerId;
            handleSuccessfulLogin(customerIdFromResponse);
          },
          (apiError) => {
            setError(apiError);
          }
        );
      } else {
        console.log("Logging in with email:", email);
        await handleApiRequest(
          () => authApi.loginWithEmail(email),
          (data) => {
            const customerIdFromResponse = data.customerId;
            handleSuccessfulLogin(customerIdFromResponse);
          },
          (apiError) => {
            setError(apiError);
          }
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      // Convert general errors to ApiError
      let apiError;
      if (err instanceof ApiError) {
        apiError = err;
      } else {
        apiError = new ApiError({
          success: false,
          error: {
            code: 1500, // ErrorCode.INTERNAL_ERROR
            message:
              err instanceof Error
                ? err.message
                : "An error occurred during login",
          },
          timestamp: new Date().toISOString(),
        });
      }

      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = (customerIdFromResponse: number) => {
    console.log("Setting customerId in localStorage:", customerIdFromResponse);
    localStorage.setItem("customerId", customerIdFromResponse.toString());

    // Double-check it was stored correctly
    setTimeout(() => {
      const storedId = localStorage.getItem("customerId");
      console.log("Stored customerId in localStorage:", storedId);
    }, 100);

    login(customerIdFromResponse);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Login to Vehicle Tracking System
        </h2>

        {error && <ErrorMessage error={error} />}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="customerId"
            >
              Customer ID
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="customerId"
              type="text"
              placeholder="Enter your customer ID"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="border-t border-gray-300 flex-grow mr-3"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need to create an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For demo purposes, use customer ID: 1</p>
          <p>or email: contact@speedylogistics.com</p>
        </div>
      </div>
    </div>
  );
}
