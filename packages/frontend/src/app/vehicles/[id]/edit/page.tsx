"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { vehiclesApi } from "@/services/api";
import { Vehicle } from "shared/types";

export default function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params as any) as { id: string };
  const vehicleId = parseInt(unwrappedParams.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    license_plate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVehicleData() {
      try {
        setLoading(true);

        const vehicleResponse = await vehiclesApi.getById(vehicleId);

        if (vehicleResponse.success) {
          setVehicle(vehicleResponse.data);
          setVehicleForm({
            license_plate: vehicleResponse.data.license_plate,
          });
        } else {
          setError(vehicleResponse.error?.message || "Failed to load vehicle");
        }
      } catch (err) {
        setError("An error occurred while fetching vehicle data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle?.id) return;

    try {
      setLoading(true);
      setError("");

      const updatedVehicle = {
        license_plate: vehicleForm.license_plate,
        customer_id: vehicle.customer_id,
      };

      console.log("Updating vehicle with data:", updatedVehicle);

      // Use the API service instead of direct fetch
      const response = await vehiclesApi.update(vehicle.id, updatedVehicle);

      // Handle response
      if (response.success) {
        alert("Vehicle updated successfully!");
        router.push(`/vehicles/${vehicle.id}`);
      } else {
        console.error("Error response:", response);
        setError(response.error?.message || "Failed to update vehicle");
      }
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError(
        "An error occurred while updating the vehicle. Check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <Link
          href={`/vehicles/${vehicleId}`}
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Vehicle
        </Link>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Vehicle not found</p>
        <Link
          href="/vehicles"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>

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
              value={vehicleForm.license_plate}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/vehicles/${vehicleId}`}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
