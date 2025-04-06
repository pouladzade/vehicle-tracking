"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { vehiclesApi } from "@/services/api";
import { Vehicle } from "shared/types";
import PositionForm from "@/components/PositionForm";
import { Toaster } from "react-hot-toast";

export default function UpdatePositionPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);
        const response = await vehiclesApi.getAll();
        if (response.success) {
          setVehicles(response.data);
        } else {
          setError(response.error?.message || "Failed to load vehicles");
        }
      } catch (err) {
        setError("An error occurred while fetching vehicles");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

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
          href="/"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Update Vehicle Position</h1>
        <Link
          href="/"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select a Vehicle</h2>

          {vehicles.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              No vehicles found. Please add a vehicle first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedVehicleId === vehicle.id
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                  onClick={() =>
                    vehicle.id !== undefined && setSelectedVehicleId(vehicle.id)
                  }
                >
                  <div className="font-semibold text-lg">
                    {vehicle.license_plate}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Vehicle ID: {vehicle.id}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedVehicleId && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Update Position for Vehicle ID: {selectedVehicleId}
              </h3>
              <PositionForm
                vehicleId={selectedVehicleId}
                onSuccess={() => {
                  setTimeout(() => {
                    router.push("/");
                  }, 2000);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
