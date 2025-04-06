"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { vehiclesApi, positionsApi } from "@/services/api";
import { Vehicle, Position } from "shared/types";

export default function VehiclePositionsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // Unwrap params using React.use()
  const resolvedParams = React.use(params as any) as { id: string };
  const vehicleId = parseInt(resolvedParams.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch vehicle details
        const vehicleResponse = await vehiclesApi.getById(vehicleId);

        // Fetch position history
        const positionsResponse = await positionsApi.getByVehicleId(vehicleId);
        console.log("positionsResponse:", positionsResponse);
        if (positionsResponse.success) {
          console.log(
            "positions data structure:",
            JSON.stringify(positionsResponse.data, null, 2)
          );
        }

        if (vehicleResponse.success) {
          setVehicle(vehicleResponse.data);
        } else {
          setError("Failed to load vehicle");
        }

        if (positionsResponse.success) {
          // The API returns positions in a nested data property
          // According to positionController.ts line 54, response is in format { data: positions }
          const responseData = positionsResponse.data as any;
          const positionsData = responseData?.data || [];

          // Sort positions by timestamp (newest first)
          const sortedPositions = [...positionsData].sort((a, b) => {
            const dateA = new Date(a.timestamp || 0);
            const dateB = new Date(b.timestamp || 0);
            return dateB.getTime() - dateA.getTime();
          });
          setPositions(sortedPositions);
        } else {
          setError("Failed to load positions");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  // Calculate trip distance based on position data
  const calculateDistance = (positions: Position[]): number => {
    if (positions.length < 2) return 0;

    // Create a chronologically-ordered copy
    const orderedPositions = [...positions].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateA.getTime() - dateB.getTime();
    });

    let totalDistance = 0;
    for (let i = 1; i < orderedPositions.length; i++) {
      const prev = orderedPositions[i - 1];
      const curr = orderedPositions[i];

      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const dLon = ((curr.longitude - prev.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prev.latitude * Math.PI) / 180) *
          Math.cos((curr.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;
    }

    return totalDistance;
  };

  const totalDistance = calculateDistance(positions);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Position History</h1>
        <Link
          href={`/vehicles/${vehicleId}`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Vehicle
        </Link>
      </div>

      {vehicle && (
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
                <dt className="text-sm font-medium text-gray-500">
                  Total Positions
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {positions.length}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Total Distance Traveled
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {totalDistance.toFixed(2)} km
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {positions.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Position Records
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Latitude
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Longitude
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Speed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ignition
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(position.timestamp || "").toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.latitude}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.longitude}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.speed !== undefined
                          ? `${position.speed} km/h`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {position.ignition !== undefined ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              position.ignition
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {position.ignition ? "On" : "Off"}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                        <a
                          href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Map
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No position data found for this vehicle.</p>
        </div>
      )}
    </div>
  );
}
