"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Vehicle, Position } from "shared/types";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface VehicleWithPosition extends Vehicle {
  position?: Position;
}

interface BasicMapProps {
  vehicles: VehicleWithPosition[];
  height?: string;
}

export default function BasicMap({
  vehicles,
  height = "400px",
}: BasicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Initialize map on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only initialize once
    if (mapRef.current && !mapInstanceRef.current) {
      console.log("Initializing Leaflet map");

      // Create map instance
      const map = L.map(mapRef.current).setView([40.7128, -74.006], 10);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Store map instance in ref
      mapInstanceRef.current = map;
    }

    // Cleanup on component unmount
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when vehicles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    console.log("Updating vehicle markers");

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Filter vehicles with valid positions
    const validVehicles = vehicles.filter(
      (v) =>
        v.position &&
        v.position.latitude &&
        v.position.longitude &&
        !isNaN(Number(v.position.latitude)) &&
        !isNaN(Number(v.position.longitude))
    );

    console.log(`Adding ${validVehicles.length} markers`);

    // Add new markers
    if (validVehicles.length > 0) {
      const bounds = L.latLngBounds();

      validVehicles.forEach((vehicle) => {
        const lat = Number(vehicle.position!.latitude);
        const lng = Number(vehicle.position!.longitude);

        // Create marker
        const marker = L.marker([lat, lng]).addTo(map).bindPopup(`
            <div>
              <strong>${vehicle.license_plate}</strong><br>
              <span>ID: ${vehicle.id}</span>
            </div>
          `);

        // Extend bounds
        bounds.extend([lat, lng]);
      });

      // Fit map to bounds with padding
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [vehicles]);

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Debug overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "white",
          padding: "5px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        Showing{" "}
        {
          vehicles.filter(
            (v) =>
              v.position &&
              v.position.latitude &&
              v.position.longitude &&
              !isNaN(Number(v.position.latitude)) &&
              !isNaN(Number(v.position.longitude))
          ).length
        }{" "}
        of {vehicles.length} vehicles
      </div>
    </div>
  );
}
