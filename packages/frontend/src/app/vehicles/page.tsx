"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { vehiclesApi, handleApiRequest, ApiError } from "@/services/api";
import { Vehicle } from "shared/types/vehicle";
import { ErrorMessage } from "@/components/ErrorHandler";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);

      const result = await handleApiRequest(
        () => vehiclesApi.getAll(),
        (data) => {
          setVehicles(data);
        },
        (apiError) => {
          setError(apiError);
        }
      );

      setLoading(false);
    }

    fetchVehicles();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      await handleApiRequest(
        () => vehiclesApi.delete(id),
        () => {
          // On success, remove vehicle from list
          setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
        },
        (apiError) => {
          setError(apiError);
        }
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Link
          href="/vehicles/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Vehicle
        </Link>
      </div>

      {error && <ErrorMessage error={error} />}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-700">No vehicles found</p>
          <Link
            href="/vehicles/new"
            className="mt-2 inline-block text-blue-500 hover:text-blue-700"
          >
            Add a new vehicle
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Plate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.license_plate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vehicle.created_at || "").toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/vehicles/${vehicle.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => vehicle.id && handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
