"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { driversApi, handleApiRequest, ApiError } from "@/services/api";
import { Driver } from "shared/types";
import { ErrorMessage } from "@/components/ErrorHandler";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);

      const result = await handleApiRequest(
        () => driversApi.getAll(),
        (data) => {
          setDrivers(data);
        },
        (apiError) => {
          setError(apiError);
        }
      );

      setLoading(false);
    }

    fetchDrivers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      await handleApiRequest(
        () => driversApi.delete(id),
        () => {
          // On success, remove driver from list
          setDrivers(drivers.filter((driver) => driver.id !== id));
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
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Link
          href="/drivers/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Driver
        </Link>
      </div>

      {error && <ErrorMessage error={error} />}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-700">No drivers found</p>
          <Link
            href="/drivers/new"
            className="mt-2 inline-block text-green-500 hover:text-green-700"
          >
            Add a new driver
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {driver.first_name} {driver.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.vehicle_id ? (
                      <Link
                        href={`/vehicles/${driver.vehicle_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View vehicle
                      </Link>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/drivers/${driver.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => driver.id && handleDelete(driver.id)}
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
