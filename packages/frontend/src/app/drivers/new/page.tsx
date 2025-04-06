"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { driversApi, vehiclesApi } from "@/services/api";
import { DriverInput, Vehicle } from "shared/types";

export default function NewDriverPage() {
  const router = useRouter();
  const [driver, setDriver] = useState<DriverInput>({
    first_name: "",
    last_name: "",
    customer_id: 1, // Default customer_id
    vehicle_id: null,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available vehicles for assignment
    async function fetchVehicles() {
      try {
        const response = await vehiclesApi.getAll();
        if (response.success) {
          setVehicles(response.data);
        }
      } catch (err) {
        console.error("Failed to load vehicles:", err);
      }
    }

    fetchVehicles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "vehicle_id") {
      setDriver((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value),
      }));
    } else {
      setDriver((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const response = await driversApi.create(driver);

      if (response.success) {
        router.push("/drivers");
      } else {
        setError(response.error?.message || "Failed to create driver");
      }
    } catch (err) {
      setError("An error occurred while creating the driver");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Driver</h1>

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
              htmlFor="first_name"
            >
              First Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="first_name"
              name="first_name"
              type="text"
              placeholder="First Name"
              value={driver.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              value={driver.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="vehicle_id"
            >
              Assign Vehicle (Optional)
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="vehicle_id"
              name="vehicle_id"
              value={driver.vehicle_id || ""}
              onChange={handleChange}
            >
              <option value="">None</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Driver"}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => router.push("/drivers")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
