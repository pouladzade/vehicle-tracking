"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import { Position, Vehicle, Trip } from "shared/types";
import Link from "next/link";

// Define the type for vehicles with position
interface VehicleWithPosition extends Vehicle {
  position?: Position;
  trip?: Trip;
}

// Props for the VehicleMap component
interface VehicleMapProps {
  vehicles: VehicleWithPosition[];
  height?: string;
  width?: string;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  vehicles,
  height = "500px",
  width = "100%",
}) => {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  // All useEffect hooks must be called in the same order on every render
  useEffect(() => {
    if (typeof window === "undefined") {
      return; // Don't run on server
    }

    // Create the map only once when component mounts and we're on client
    if (!mapInitialized) {
      try {
        console.log("Initializing Leaflet map...");

        // Make sure Leaflet CSS is loaded
        require("leaflet/dist/leaflet.css");

        // Setup marker icon
        const defaultIcon = L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        L.Marker.prototype.options.icon = defaultIcon;

        // Create container for the map
        const mapContainer = document.getElementById("leaflet-map");
        if (!mapContainer) {
          throw new Error("Map container not found");
        }

        // Calculate center position
        const center = getMapCenter();
        console.log("Map center:", center);

        // Initialize map
        const map = L.map(mapContainer, {
          center: center as L.LatLngExpression,
          zoom: 10,
          zoomControl: false,
        });

        // Add zoom control
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Store map instance
        setMapInstance(map);
        setMapInitialized(true);
        console.log("Map initialized successfully");
      } catch (err) {
        console.error("Error initializing map:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize map"
        );
      }
    }

    return () => {
      // Clean up map instance on component unmount
      if (mapInstance) {
        console.log("Cleaning up map instance");
        mapInstance.remove();
      }
    };
  }, [mapInitialized]);

  // Update markers when vehicles or map instance changes
  useEffect(() => {
    if (!mapInstance || !mapInitialized) {
      return;
    }

    try {
      console.log("Updating map markers...");

      // Clear existing markers
      mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.removeLayer(layer);
        }
      });

      // Filter vehicles with valid positions
      const validVehicles = vehicles.filter(
        (vehicle) =>
          vehicle.position &&
          vehicle.position.latitude !== undefined &&
          vehicle.position.longitude !== undefined &&
          !isNaN(Number(vehicle.position.latitude)) &&
          !isNaN(Number(vehicle.position.longitude))
      );

      console.log(`Adding ${validVehicles.length} markers to map`);

      // Add markers for vehicles with positions
      validVehicles.forEach((vehicle) => {
        const lat = Number(vehicle.position!.latitude);
        const lng = Number(vehicle.position!.longitude);

        // Skip invalid coordinates
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          console.warn(`Invalid coordinates for vehicle ${vehicle.id}:`, {
            lat,
            lng,
          });
          return;
        }

        // Create marker
        const marker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(`
            <div class="text-sm">
              <p class="font-bold">${vehicle.license_plate}</p>
              <p>
                Last updated: 
                ${
                  vehicle.position?.timestamp
                    ? new Date(vehicle.position.timestamp).toLocaleString()
                    : "Unknown"
                }
              </p>
              ${
                vehicle.position?.speed !== undefined &&
                !isNaN(vehicle.position.speed)
                  ? `<p>Speed: ${vehicle.position.speed} km/h</p>`
                  : ""
              }
              <div class="mt-2">
                <a href="/vehicles/${
                  vehicle.id
                }" class="text-blue-500 hover:text-blue-700 mr-2">
                  Vehicle Details
                </a>
                ${
                  vehicle.trip
                    ? `<a href="/trips/${vehicle.trip.id}" class="text-green-500 hover:text-green-700">
                      Active Trip
                     </a>`
                    : ""
                }
              </div>
            </div>
          `);
      });

      // Debug info overlay
      const debugInfoContainer = document.createElement("div");
      debugInfoContainer.style.zIndex = "1000";
      debugInfoContainer.style.position = "absolute";
      debugInfoContainer.style.top = "10px";
      debugInfoContainer.style.left = "10px";
      debugInfoContainer.style.background = "white";
      debugInfoContainer.style.padding = "5px";
      debugInfoContainer.style.borderRadius = "4px";
      debugInfoContainer.style.fontSize = "12px";
      debugInfoContainer.innerHTML = `
        <div>
          Showing ${validVehicles.length} of ${vehicles.length} vehicles
          ${
            vehicles.length > 0 && vehicles.some((v) => v.position)
              ? `<div style="font-size: 10px; margin-top: 4px;">
                Coordinate types: ${typeof vehicles.find((v) => v.position)
                  ?.position?.latitude}
               </div>`
              : ""
          }
        </div>
      `;

      // Find and replace existing debug info or add it
      const existingDebugInfo = document.querySelector(".leaflet-debug-info");
      if (existingDebugInfo) {
        existingDebugInfo.replaceWith(debugInfoContainer);
      } else {
        mapInstance.getContainer().appendChild(debugInfoContainer);
      }
      debugInfoContainer.className = "leaflet-debug-info";

      // Adjust map view if we have vehicles
      if (validVehicles.length > 0) {
        const bounds = L.latLngBounds(
          validVehicles.map((v) => [
            Number(v.position!.latitude),
            Number(v.position!.longitude),
          ])
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }

      console.log("Map markers updated successfully");
    } catch (err) {
      console.error("Error updating map markers:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update map markers"
      );
    }
  }, [vehicles, mapInstance, mapInitialized]);

  // Calculate the center position based on vehicle positions
  const getMapCenter = () => {
    // Filter vehicles with valid positions
    const vehiclesWithPositions = vehicles.filter(
      (vehicle) =>
        vehicle.position &&
        vehicle.position.latitude !== undefined &&
        vehicle.position.longitude !== undefined &&
        !isNaN(Number(vehicle.position.latitude)) &&
        !isNaN(Number(vehicle.position.longitude))
    );

    if (vehiclesWithPositions.length === 0) {
      // Default to New York City if no vehicles have positions
      return [40.7128, -74.006];
    }

    // Calculate average lat/lng to center the map
    const sumLat = vehiclesWithPositions.reduce(
      (sum, v) => sum + Number(v.position!.latitude),
      0
    );
    const sumLng = vehiclesWithPositions.reduce(
      (sum, v) => sum + Number(v.position!.longitude),
      0
    );

    return [
      sumLat / vehiclesWithPositions.length,
      sumLng / vehiclesWithPositions.length,
    ];
  };

  if (error) {
    return (
      <div
        style={{ height, width }}
        className="flex items-center justify-center bg-red-100 rounded-lg"
      >
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold mb-1">Map Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapInitialized) {
    return (
      <div
        style={{ height, width }}
        className="flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden shadow-lg relative"
      style={{
        height,
        width,
        position: "relative",
      }}
    >
      <div
        id="leaflet-map"
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default VehicleMap;
