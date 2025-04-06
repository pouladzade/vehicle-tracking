"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { driversApi, vehiclesApi } from "@/services/api";
import { Driver, Vehicle } from "shared/types";

export default function DriverDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const resolvedParams = React.use(params as any) as { id: string };
  const driverId = parseInt(resolvedParams.id);

  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDriverData() {
      try {
        setLoading(true);

        // Fetch driver details
        const driverResponse = await driversApi.getById(driverId);

        if (driverResponse.success) {
          setDriver(driverResponse.data);

          // Fetch vehicle details if assigned
          if (driverResponse.data.vehicle_id) {
            const vehicleResponse = await vehiclesApi.getById(
              driverResponse.data.vehicle_id
            );
            if (vehicleResponse.success) {
              setVehicle(vehicleResponse.data);
            }
          }
        } else {
          setError(driverResponse.error?.message || "Failed to load driver");
        }
      } catch (err) {
        setError("An error occurred while fetching driver data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const handleDelete = async () => {
    if (!driver?.id) return;

    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        const response = await driversApi.delete(driver.id);

        if (response.success) {
          router.push("/drivers");
        } else {
          setError(response.error?.message || "Failed to delete driver");
        }
      } catch (err) {
        setError("An error occurred while deleting the driver");
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <Link
          href="/drivers"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Drivers
        </Link>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Driver not found</p>
        <Link
          href="/drivers"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Details</h1>
        <div className="space-x-2">
          <Link
            href={`/drivers/${driver.id}/edit`}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Driver Information
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {driver.first_name} {driver.last_name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(driver.created_at || "").toLocaleString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Assigned Vehicle
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle ? (
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {vehicle.license_plate}
                  </Link>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/drivers" className="text-blue-500 hover:text-blue-700">
          Back to Drivers
        </Link>
      </div>
    </div>
  );
}
