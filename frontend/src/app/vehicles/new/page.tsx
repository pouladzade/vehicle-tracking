"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { vehiclesApi } from "@/services/api";
import { VehicleInput } from "shared/types/vehicle";

export default function NewVehiclePage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleInput>({
    license_plate: "",
    customer_id: 1, // Default customer_id, ideally this would come from auth context
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle((prev: VehicleInput) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const response = await vehiclesApi.create(vehicle);

      if (response.success) {
        router.push("/vehicles");
      } else {
        setError(response.error?.message || "Failed to create vehicle");
      }
    } catch (err) {
      setError("An error occurred while creating the vehicle");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="license_plate"
            >
              License Plate
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="license_plate"
              name="license_plate"
              type="text"
              placeholder="e.g., ABC-123"
              value={vehicle.license_plate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Vehicle"}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => router.push("/vehicles")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
