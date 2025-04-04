"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tripsApi, vehiclesApi, driversApi } from "@/services/api";
import { Vehicle, Driver } from "shared/types";
import { useAuth } from "@/contexts/AuthContext";

export default function NewTripPage() {
  const router = useRouter();
  const { customerId } = useAuth();

  const [trip, setTrip] = useState({
    vehicle_id: "",
    driver_id: "",
    start_time: new Date().toISOString(),
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available vehicles and drivers
    async function fetchData() {
      try {
        const [vehiclesResponse, driversResponse] = await Promise.all([
          vehiclesApi.getAll(),
          driversApi.getAll(),
        ]);

        if (vehiclesResponse.success) {
          setVehicles(vehiclesResponse.data);
        }

        if (driversResponse.success) {
          setDrivers(driversResponse.data);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load vehicles and drivers");
      }
    }

    fetchData();
  }, [customerId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "vehicle_id" || name === "driver_id") {
      setTrip((prev) => ({
        ...prev,
        [name]: value === "" ? "" : value,
      }));
    } else {
      setTrip((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Data validation
    if (!trip.vehicle_id || !trip.driver_id) {
      setError("Please select both a vehicle and a driver");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tripData = {
        vehicle_id: parseInt(trip.vehicle_id as string),
        driver_id: parseInt(trip.driver_id as string),
        start_time: new Date(trip.start_time),
      };

      console.log("Submitting trip data:", tripData);

      const response = await tripsApi.create(tripData);
      console.log("Trip creation response:", response);

      if (response.success) {
        router.push("/trips");
      } else {
        setError(response.error?.message || "Failed to start trip");
      }
    } catch (err) {
      setError("An error occurred while starting the trip");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Start New Trip</h1>

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
              htmlFor="vehicle_id"
            >
              Vehicle
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="vehicle_id"
              name="vehicle_id"
              value={trip.vehicle_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="driver_id"
            >
              Driver
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="driver_id"
              name="driver_id"
              value={trip.driver_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.first_name} {driver.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Trip"}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => router.push("/trips")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
