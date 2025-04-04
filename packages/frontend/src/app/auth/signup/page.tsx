"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { customersApi } from "@/services/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      setError("All fields are required");
      return;
    }

    // Simple email validation
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Make API call to create a new customer
      const response = await customersApi.create({ name, email });

      if (response.success) {
        const newCustomer = response.data;
        setSuccess(
          `Account created successfully! Your customer ID is: ${newCustomer.id}`
        );
      } else {
        setError(response.error?.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create a New Account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{success}</p>
            <p className="mt-2">
              You will be automatically redirected to the dashboard in 2
              seconds...
            </p>
            <div className="mt-2">
              <Link
                href="/auth/login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Go to Login
              </Link>          
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Company Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Enter your company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
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
                required
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
