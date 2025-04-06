"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { vehiclesApi, positionsApi, driversApi } from "@/services/api";
import { Vehicle, Position, Driver } from "shared/types";
import PositionForm from "@/components/PositionForm";

export default function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // Unwrap params using React.use()
  const resolvedParams = React.use(params as any) as { id: string };
  const vehicleId = parseInt(resolvedParams.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [positionLoading, setPositionLoading] = useState(false);

  // Function to refresh position data
  const refreshPositionData = async () => {
    try {
      if (vehicleId) {
        console.log(`Refreshing position data for vehicle ${vehicleId}...`);
        setPositionLoading(true);

        const positionResponse = await positionsApi.getLatestByVehicleId(
          vehicleId
        );

        console.log(`Position refresh response:`, positionResponse);

        if (positionResponse.success && positionResponse.data) {
          setLastPosition(positionResponse.data);
          console.log(`Updated position data:`, positionResponse.data);
        } else {
          console.warn(
            `Failed to get position data: ${positionResponse.message}`
          );
          // Don't clear existing position data if the API call fails
        }
      }
    } catch (error) {
      console.error("Error refreshing position data:", error);
    } finally {
      setPositionLoading(false);
    }
  };

  useEffect(() => {
    async function fetchVehicleData() {
      try {
        setLoading(true);

        // Fetch vehicle details
        const vehicleResponse = await vehiclesApi.getById(vehicleId);

        if (vehicleResponse.success) {
          setVehicle(vehicleResponse.data);

          // Fetch last position
          const positionResponse = await positionsApi.getLatestByVehicleId(
            vehicleId
          );
          if (positionResponse.success && positionResponse.data) {
            setLastPosition(positionResponse.data);
          }

          // Fetch driver info if assigned to this vehicle
          const driversResponse = await driversApi.getAll();
          if (driversResponse.success) {
            const assignedDriver = driversResponse.data.find(
              (driver: Driver) => driver.vehicle_id === vehicleId
            );
            if (assignedDriver) {
              setAssignedDriver(assignedDriver);
            }
          }
        } else {
          setError(vehicleResponse?.error?.message || "Failed to load vehicle");
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

  const handleDelete = async () => {
    if (!vehicle?.id) return;

    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await vehiclesApi.delete(vehicle.id);

        if (response.success) {
          router.push("/vehicles");
        } else {
          // Display a more detailed error message if provided
          const errorMessage =
            response.error?.message || "Failed to delete vehicle";
          setError(errorMessage);
          console.error("Delete vehicle error:", response);
        }
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        setError(
          typeof err === "object" && err && "message" in err
            ? String(err.message)
            : "An error occurred while deleting the vehicle"
        );
      }
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
          href="/vehicles"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Vehicles
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Details</h1>
        <div className="space-x-2">
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
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
            Vehicle Information
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                License Plate
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.license_plate}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(vehicle.created_at || "").toLocaleString()}
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
          </dl>
        </div>
      </div>

      {lastPosition && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Last Known Position
              </h3>
              <button
                onClick={refreshPositionData}
                disabled={positionLoading}
                className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {positionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
            <Link
              href={`/vehicles/${vehicle.id}/positions`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View All Positions
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Coordinates
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {lastPosition.latitude}, {lastPosition.longitude}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Timestamp
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(lastPosition.timestamp || "").toLocaleString()}
                    </dd>
                  </div>
                  {lastPosition.speed !== undefined && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Speed
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {lastPosition.speed} km/h
                      </dd>
                    </div>
                  )}
                  {lastPosition.ignition !== undefined && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Ignition
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lastPosition.ignition
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {lastPosition.ignition ? "On" : "Off"}
                        </span>
                      </dd>
                    </div>
                  )}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(lastPosition.timestamp || "").toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="md:w-1/2 p-4">
                <div className="border rounded-lg overflow-hidden h-64">
                  <iframe
                    title="Vehicle Location"
                    className="w-full h-full"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${lastPosition.latitude},${lastPosition.longitude}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-4 flex justify-center">
                  <a
                    href={`https://www.google.com/maps?q=${lastPosition.latitude},${lastPosition.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!lastPosition && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                No Position Data
              </h3>
              <button
                onClick={refreshPositionData}
                disabled={positionLoading}
                className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {positionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    Check for Position
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <p className="text-lg text-gray-600 mb-2">
                No position data found for this vehicle
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Use the Position Management section below to update the position
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Position Management Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Position Management
          </h3>
          <button
            onClick={() => setShowPositionForm(!showPositionForm)}
            className={`${
              showPositionForm ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4 rounded`}
          >
            {showPositionForm ? "Cancel" : "Update Position"}
          </button>
        </div>

        {showPositionForm && (
          <div className="border-t border-gray-200 p-4">
            <PositionForm
              vehicleId={vehicleId}
              onSuccess={() => {
                setShowPositionForm(false);
                refreshPositionData();
              }}
            />
          </div>
        )}
      </div>

      {assignedDriver && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Assigned Driver
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {assignedDriver.first_name} {assignedDriver.last_name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Details</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <Link
                    href={`/drivers/${assignedDriver.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View driver details
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link href="/vehicles" className="text-blue-500 hover:text-blue-700">
          Back to Vehicles
        </Link>
      </div>
    </div>
  );
}
