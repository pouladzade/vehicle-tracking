"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { tripsApi, vehiclesApi, driversApi } from "@/services/api";
import { Trip } from "shared/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
  const [driverMap, setDriverMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch all resources in parallel
        const [tripsResponse, vehiclesResponse, driversResponse] =
          await Promise.all([
            tripsApi.getAll(),
            vehiclesApi.getAll(),
            driversApi.getAll(),
          ]);

        if (tripsResponse.success) {
          setTrips(tripsResponse.data);

          // Create vehicle lookup map
          if (vehiclesResponse.success) {
            const vehicleMap: Record<string, string> = {};
            vehiclesResponse.data.forEach((vehicle: any) => {
              vehicleMap[vehicle.id] = vehicle.license_plate;
            });
            setVehicleMap(vehicleMap);
          }

          // Create driver lookup map
          if (driversResponse.success) {
            const driverMap: Record<string, string> = {};
            driversResponse.data.forEach((driver: any) => {
              driverMap[driver.id] = `${driver.first_name} ${driver.last_name}`;
            });
            setDriverMap(driverMap);
          }
        } else {
          setError(tripsResponse.error?.message || "Failed to load trips");
        }
      } catch (err) {
        setError("An error occurred while fetching trips");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        const response = await tripsApi.delete(id);

        if (response.success) {
          setTrips(trips.filter((trip) => trip.id !== id));
        } else {
          setError(response.error?.message || "Failed to delete trip");
        }
      } catch (err) {
        setError("An error occurred while deleting the trip");
        console.error(err);
      }
    }
  };

  const handleEndTrip = async (id: number) => {
    if (window.confirm("Are you sure you want to end this trip?")) {
      try {
        setLoading(true);
        const response = await tripsApi.endTrip(id);

        if (response.success) {
          // Replace the trip in the list with the updated one
          setTrips(
            trips.map((trip) => (trip.id === id ? response.data : trip))
          );
        } else {
          setError(response.error?.message || "Failed to end trip");
        }
      } catch (err) {
        setError("An error occurred while ending the trip");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getTripStatus = (trip: any) => {
    if (trip.end_time) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Completed
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link
          href="/trips/new"
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Start New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-700">No trips found</p>
          <Link
            href="/trips/new"
            className="mt-2 inline-block text-purple-500 hover:text-purple-700"
          >
            Start a new trip
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
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
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicleMap[trip.vehicle_id] || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {driverMap[trip.driver_id] || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trip.start_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTripStatus(trip)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    {!trip.end_time && (
                      <button
                        onClick={() => handleEndTrip(trip.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        End Trip
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(trip.id)}
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
