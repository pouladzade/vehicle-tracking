"use client";

import React, { useEffect, useState } from "react";
import {
  vehiclesApi,
  driversApi,
  tripsApi,
  positionsApi,
} from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Vehicle, Driver, Trip, Position } from "shared/types";
import "leaflet/dist/leaflet.css";

// Dynamically import the BasicMap component with no SSR
// This prevents server-side rendering issues with Leaflet
const BasicMap = dynamic(() => import("@/components/BasicMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  ),
});

// Extended type for Vehicle with position data
interface VehicleWithPosition extends Vehicle {
  position?: Position;
  trip?: Trip;
}

// Error boundary component
const MapErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Add global error handler for the map
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("Invalid LatLng")) {
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="bg-yellow-100 p-6 rounded-lg text-center h-96 flex items-center justify-center">
        <div>
          <p className="text-yellow-700 mb-2">Map could not be loaded</p>
          <p className="text-sm text-yellow-600">
            There was an error loading the map. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    activeTrips: 0,
  });
  const [vehicles, setVehicles] = useState<VehicleWithPosition[]>([]);
  const [vehiclesWithPositions, setVehiclesWithPositions] = useState<
    VehicleWithPosition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, loading: authLoading, customerId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isAuthenticated) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        console.log("Fetching data with customerId:", customerId);

        // Fetch vehicles with positions and active trips
        const vehiclesResponse = await vehiclesApi.getAll();
        console.log("Vehicle response:", vehiclesResponse);

        // Fetch drivers count
        const driversResponse = await driversApi.getAll();
        console.log("Driver response:", driversResponse);

        // Fetch trips
        const tripsResponse = await tripsApi.getAll();
        console.log("Trips response:", tripsResponse);

        if (
          vehiclesResponse.success &&
          driversResponse.success &&
          tripsResponse.success
        ) {
          const vehicleList = vehiclesResponse.data;
          const activeTrips = tripsResponse.data.filter(
            (trip) => !trip.end_time
          );

          // Augment vehicles with active trip data
          const vehiclesWithTrips = vehicleList.map((vehicle) => {
            const activeTrip = activeTrips.find(
              (trip) => trip.vehicle_id === vehicle.id
            );

            return {
              ...vehicle,
              trip: activeTrip,
            };
          });

          // Track successful position fetches
          const vehiclePositions: Record<number, Position> = {};

          // Fetch positions for each vehicle (in parallel)
          await Promise.all(
            vehiclesWithTrips.map(async (vehicle) => {
              try {
                if (vehicle.id !== undefined) {
                  console.log(
                    `Fetching position for vehicle ID: ${vehicle.id}`
                  );
                  const positionResponse =
                    await positionsApi.getLatestByVehicleId(vehicle.id);
                  console.log(
                    `Position response for vehicle ${vehicle.id}:`,
                    positionResponse
                  );

                  if (positionResponse.success && positionResponse.data) {
                    // Handle the case where the backend returns { data: Position }
                    let positionData = positionResponse.data;

                    // Check if there's a nested data property (from the database response)
                    if (
                      typeof positionData === "object" &&
                      "data" in positionData
                    ) {
                      console.log(
                        `Found nested data property structure:`,
                        positionData
                      );
                      positionData = (positionData as any).data;
                    }

                    // Explicitly log coordinates to see what we're getting
                    console.log(
                      `Raw position data for vehicle ${vehicle.id}:`,
                      positionData
                    );
                    if (positionData) {
                      console.log(`Coordinates for vehicle ${vehicle.id}:`, {
                        latitude: positionData.latitude,
                        longitude: positionData.longitude,
                        type: {
                          lat: typeof positionData.latitude,
                          lng: typeof positionData.longitude,
                        },
                      });
                    }

                    // Ensure we have valid coordinates
                    if (
                      positionData &&
                      positionData.latitude &&
                      positionData.longitude &&
                      !isNaN(Number(positionData.latitude)) &&
                      !isNaN(Number(positionData.longitude))
                    ) {
                      // Convert string coordinates to numbers
                      const positionWithNumberCoords = {
                        ...positionData,
                        latitude: Number(positionData.latitude),
                        longitude: Number(positionData.longitude),
                        speed: positionData.speed
                          ? Number(positionData.speed)
                          : undefined,
                      };

                      console.log(
                        `Valid position added for vehicle ${vehicle.id}:`,
                        positionWithNumberCoords
                      );
                      vehiclePositions[vehicle.id] = positionWithNumberCoords;
                    } else {
                      console.warn(
                        `Invalid position data for vehicle ${vehicle.id}:`,
                        positionData
                      );
                    }
                  } else {
                    console.warn(`No position data for vehicle ${vehicle.id}`);
                  }
                }
              } catch (err) {
                console.error(
                  `Error fetching position for vehicle ${vehicle.id}:`,
                  err
                );
              }
            })
          );

          // Combine all data
          const vehiclesWithData: VehicleWithPosition[] = vehiclesWithTrips.map(
            (vehicle) => {
              const position =
                vehicle.id !== undefined
                  ? vehiclePositions[vehicle.id]
                  : undefined;
              return {
                ...vehicle,
                position,
              };
            }
          );

          console.log("Final vehicles with data:", vehiclesWithData);

          // Debug: Check if vehicles have valid positions
          const vehiclesWithValidPositions = vehiclesWithData.filter(
            (v) =>
              v.position &&
              v.position.latitude !== undefined &&
              v.position.longitude !== undefined &&
              !isNaN(Number(v.position.latitude)) &&
              !isNaN(Number(v.position.longitude))
          );

          console.log(
            "Vehicles with position count:",
            vehiclesWithValidPositions.length
          );

          if (vehiclesWithValidPositions.length > 0) {
            console.log(
              "Example of valid vehicle position:",
              vehiclesWithValidPositions[0].position
            );
          } else if (
            vehiclesWithData.length > 0 &&
            vehiclesWithData[0].position
          ) {
            console.log("Example of invalid vehicle position:", {
              position: vehiclesWithData[0].position,
              positionType: typeof vehiclesWithData[0].position,
              lat: vehiclesWithData[0].position.latitude,
              latType: typeof vehiclesWithData[0].position.latitude,
              lng: vehiclesWithData[0].position.longitude,
              lngType: typeof vehiclesWithData[0].position.longitude,
            });
          }

          setVehicles(vehiclesWithData);
          setVehiclesWithPositions(vehiclesWithData);
          setStats({
            vehicles: vehicleList.length,
            drivers: driversResponse.data.length,
            activeTrips: activeTrips.length,
          });
        } else {
          const errorMessage =
            (vehiclesResponse.success
              ? vehiclesResponse.message
              : vehiclesResponse.error?.message) ||
            (driversResponse.success
              ? driversResponse.message
              : driversResponse.error?.message) ||
            (tripsResponse.success
              ? tripsResponse.message
              : tripsResponse.error?.message) ||
            "Failed to load dashboard data";
          console.error("API Error:", errorMessage);
          setError(errorMessage);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("An error occurred while fetching dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [isAuthenticated, authLoading, router, customerId]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="z-10 w-full">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Vehicles
                  </h2>
                  <span className="text-3xl font-bold text-blue-600">
                    {stats.vehicles}
                  </span>
                </div>
                <Link
                  href="/vehicles"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-700"
                >
                  View all vehicles →
                </Link>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Drivers
                  </h2>
                  <span className="text-3xl font-bold text-green-600">
                    {stats.drivers}
                  </span>
                </div>
                <Link
                  href="/drivers"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-700"
                >
                  View all drivers →
                </Link>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Active Trips
                  </h2>
                  <span className="text-3xl font-bold text-purple-600">
                    {stats.activeTrips}
                  </span>
                </div>
                <Link
                  href="/trips"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-700"
                >
                  View all trips →
                </Link>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Vehicle Locations {loading ? "(Loading...)" : ""}
                </h2>
                <Link
                  href="/update-position"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow"
                >
                  Update Vehicle Position
                </Link>
              </div>

              {vehiclesWithPositions.filter(
                (v) =>
                  v.position &&
                  v.position.latitude !== undefined &&
                  v.position.longitude !== undefined &&
                  !isNaN(Number(v.position.latitude)) &&
                  !isNaN(Number(v.position.longitude))
              ).length > 0 ? (
                <div
                  className="h-96 border border-gray-200 rounded-lg"
                  style={{ minHeight: "400px" }}
                >
                  <MapErrorBoundary>
                    <BasicMap vehicles={vehiclesWithPositions} height="100%" />
                  </MapErrorBoundary>
                </div>
              ) : (
                <div className="bg-gray-100 p-6 rounded-lg text-center">
                  <p className="text-gray-700">
                    No position data available for any vehicles
                  </p>
                  <Link
                    href="/vehicles"
                    className="mt-2 inline-block text-blue-500 hover:text-blue-700"
                  >
                    Update vehicle positions
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/vehicles/new"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Vehicle
                </Link>
                <Link
                  href="/drivers/new"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Driver
                </Link>
                <Link
                  href="/trips/new"
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Start Trip
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
