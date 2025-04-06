"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  tripsApi,
  vehiclesApi,
  driversApi,
  positionsApi,
} from "@/services/api";
import { Trip, Vehicle, Driver, Position } from "shared/types";

// Helper function to calculate distance between two points
function calculateDistance(positions: Position[]): number {
  if (positions.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < positions.length; i++) {
    const prevPos = positions[i - 1];
    const currPos = positions[i];

    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Earth radius in km
    const dLat = ((currPos.latitude - prevPos.latitude) * Math.PI) / 180;
    const dLon = ((currPos.longitude - prevPos.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((prevPos.latitude * Math.PI) / 180) *
        Math.cos((currPos.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    totalDistance += distance;
  }

  return totalDistance;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const resolvedParams = React.use(params as any) as { id: string };
  const tripId = parseInt(resolvedParams.id);

  // Validate that the trip ID is a valid integer
  useEffect(() => {
    if (isNaN(tripId) || tripId <= 0) {
      router.push("/trips");
    }
  }, [tripId, router]);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTripData() {
      try {
        setLoading(true);

        // Fetch trip details
        const tripResponse = await tripsApi.getById(tripId);
        console.log("Trip detail response:", tripResponse);

        if (tripResponse.success) {
          setTrip(tripResponse.data);

          // Fetch vehicle and driver details
          const vehicleId = tripResponse.data.vehicle_id;
          const driverId = tripResponse.data.driver_id;

          try {
            const [vehicleResponse, driverResponse] = await Promise.all([
              vehiclesApi.getById(vehicleId),
              driversApi.getById(driverId),
            ]);

            if (vehicleResponse.success) {
              setVehicle(vehicleResponse.data);
            } else {
              console.error(
                "Failed to fetch vehicle:",
                vehicleResponse.error?.message
              );
            }

            if (driverResponse.success) {
              setDriver(driverResponse.data);
            } else {
              console.error(
                "Failed to fetch driver:",
                driverResponse.error?.message
              );
            }

            // Fetch positions separately to handle errors gracefully
            try {
              const positionsResponse = await positionsApi.getByVehicleId(
                vehicleId
              );

              if (positionsResponse.success && positionsResponse.data) {
                // Filter positions that occurred during the trip
                const tripStartTime = new Date(
                  tripResponse.data.start_time
                ).getTime();
                const tripEndTime = tripResponse.data.end_time
                  ? new Date(tripResponse.data.end_time).getTime()
                  : Date.now();

                const filteredPositions = positionsResponse.data.filter(
                  (pos: Position) => {
                    if (!pos.timestamp) return false;
                    const posTime = new Date(pos.timestamp).getTime();
                    return posTime >= tripStartTime && posTime <= tripEndTime;
                  }
                );

                setPositions(filteredPositions);

                // Calculate distance
                if (filteredPositions.length > 0) {
                  const calculatedDistance =
                    calculateDistance(filteredPositions);
                  setDistance(calculatedDistance);
                }
              } else {
                console.error("Failed to fetch positions:");
              }
            } catch (posErr) {
              console.error("Error fetching positions:", posErr);
            }

            // Fetch the latest position for the vehicle
            try {
              // Directly check and validate all values involved
              const vehicleIdForPosition = trip?.vehicle_id || vehicleId;
              console.log({
                vehicleIdDebug: {
                  tripVehicleId: trip?.vehicle_id,
                  urlVehicleId: vehicleId,
                  useVehicleId: vehicleIdForPosition,
                },
                customerIdDebug: localStorage.getItem("customerId"),
              });

              console.log(
                `Trying to fetch latest position for vehicle ${vehicleIdForPosition}...`
              );

              if (!vehicleIdForPosition) {
                console.warn("No vehicleId available for position lookup");
              } else {
                // Force conversion to number to ensure correct type
                const latestPositionResponse =
                  await positionsApi.getLatestByVehicleId(
                    Number(vehicleIdForPosition)
                  );

                // Log the full response for debugging
                console.log(
                  "Latest position raw response object:",
                  latestPositionResponse
                );

                if (
                  latestPositionResponse &&
                  latestPositionResponse.success === true &&
                  latestPositionResponse.data
                ) {
                  console.log(
                    "Position data found:",
                    latestPositionResponse.data
                  );
                  setCurrentPosition(latestPositionResponse.data);
                  console.log("Successfully set current position data");
                } else {
                  const errorMsg =
                    latestPositionResponse?.message ||
                    "No response from position API";
                  console.error(
                    "Failed to fetch latest position:",
                    errorMsg,
                    latestPositionResponse
                  );
                }
              }
            } catch (posErr) {
              console.error("Error in position fetch:", posErr);
            }
          } catch (detailsErr) {
            console.error("Error fetching vehicle/driver details:", detailsErr);
          }
        } else {
          setError(tripResponse.error?.message || "Failed to load trip");
        }
      } catch (err) {
        setError("An error occurred while fetching trip data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  const handleDelete = async () => {
    if (!trip?.id) return;

    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        const response = await tripsApi.delete(trip.id);

        if (response.success) {
          router.push("/trips");
        } else {
          setError(response.error?.message || "Failed to delete trip");
        }
      } catch (err) {
        setError("An error occurred while deleting the trip");
        console.error(err);
      }
    }
  };

  const handleEndTrip = async () => {
    if (!trip?.id || trip.end_time) return;

    if (window.confirm("Are you sure you want to end this trip?")) {
      try {
        setLoading(true);

        console.log("Ending trip with ID:", trip.id);

        // Use the dedicated API endpoint for ending trips
        const response = await tripsApi.endTrip(trip.id);

        // Handle response
        if (response.success) {
          const updatedTrip = response.data;

          // Update local state with the returned trip data
          setTrip(updatedTrip);

          // Update distance if available
          if (updatedTrip.distance) {
            setDistance(updatedTrip.distance);
          }

          // Show success message
          alert("Trip ended successfully");
        } else {
          console.error("Error response:", response);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <Link
          href="/trips"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Trips
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Trip not found</p>
        <Link
          href="/trips"
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Trips
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Details</h1>
        <div className="space-x-2">
          {!trip.end_time && (
            <button
              onClick={handleEndTrip}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              End Trip
            </button>
          )}
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
            Trip Information
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    trip.end_time
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {trip.end_time ? "Completed" : "Active"}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(trip.start_time || "").toLocaleString()}
              </dd>
            </div>
            {trip.end_time && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">End Time</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(trip.end_time).toLocaleString()}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Distance</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {trip.distance && typeof trip.distance === "number"
                  ? `${trip.distance.toFixed(2)} km`
                  : `${distance.toFixed(2)} km (estimated)`}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle ? (
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {vehicle.license_plate}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Driver</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {driver ? (
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {driver.first_name} {driver.last_name}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Current Vehicle Location */}
      {currentPosition && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Current Vehicle Location
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Coordinates
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentPosition.latitude}, {currentPosition.longitude}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentPosition.timestamp
                    ? new Date(currentPosition.timestamp).toLocaleString()
                    : "Unknown"}
                </dd>
              </div>
              {currentPosition.speed !== undefined && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Speed</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentPosition.speed} km/h
                  </dd>
                </div>
              )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Map</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a
                    href={`https://www.google.com/maps?q=${currentPosition.latitude},${currentPosition.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View on Google Maps
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Route Positions */}
      {positions.length > 1 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Route Positions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {positions.length} position{positions.length !== 1 ? "s" : ""}{" "}
              recorded during this trip
            </p>
          </div>

          {/* Route map visualization */}
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Route Map
            </h4>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <div className="mb-2">
                <strong>Start Point:</strong> {positions[0].latitude},{" "}
                {positions[0].longitude}
              </div>
              <div className="mb-2">
                <strong>End Point:</strong>{" "}
                {positions[positions.length - 1].latitude},{" "}
                {positions[positions.length - 1].longitude}
              </div>
              <div className="mb-2">
                <strong>Total Distance:</strong> {distance.toFixed(2)} km
              </div>

              <a
                href={`https://www.google.com/maps/dir/${
                  positions[0].latitude
                },${positions[0].longitude}/${
                  positions[positions.length - 1].latitude
                },${positions[positions.length - 1].longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mt-2"
              >
                View Route on Google Maps
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="px-4 py-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latitude
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Longitude
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Speed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
      )}

      <div className="mt-6">
        <Link href="/trips" className="text-blue-500 hover:text-blue-700">
          Back to Trips
        </Link>
      </div>
    </div>
  );
}
