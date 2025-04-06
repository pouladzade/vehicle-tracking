"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { driversApi, vehiclesApi } from "@/services/api";
import { Driver, Vehicle } from "shared/types";

export default function EditDriverPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Type casting is needed because of how Next.js types params
  const unwrappedParams = React.use(params as any) as { id: string };
  const driverId = parseInt(unwrappedParams.id);

  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverForm, setDriverForm] = useState({
    first_name: "",
    last_name: "",
    vehicle_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch driver details
        const driverResponse = await driversApi.getById(driverId);

        // Fetch available vehicles
        const vehiclesResponse = await vehiclesApi.getAll();

        if (driverResponse.success) {
          setDriver(driverResponse.data);

          // Set form values
          setDriverForm({
            first_name: driverResponse.data.first_name,
            last_name: driverResponse.data.last_name,
            vehicle_id: driverResponse.data.vehicle_id
              ? driverResponse.data.vehicle_id.toString()
              : "",
          });
        } else {
          setError(driverResponse.error?.message || "Failed to load driver");
        }

        if (vehiclesResponse.success) {
          setVehicles(vehiclesResponse.data);
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (driverId) {
      fetchData();
    }
  }, [driverId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDriverForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driver?.id) return;

    try {
      setLoading(true);
      setError("");

      // Convert vehicle_id to number or null
      const vehicle_id = driverForm.vehicle_id
        ? parseInt(driverForm.vehicle_id)
        : null;

      const updatedDriver = {
        first_name: driverForm.first_name,
        last_name: driverForm.last_name,
        vehicle_id: vehicle_id,
        customer_id: driver.customer_id,
      };

      console.log("Updating driver with data:", updatedDriver);

      // Use the API service instead of direct fetch
      const response = await driversApi.update(driver.id, updatedDriver);

      // Handle response
      if (response.success) {
        alert("Driver updated successfully!");
        router.push(`/drivers/${driver.id}`);
      } else {
        console.error("Error response:", response);
        setError(response.error?.message || "Failed to update driver");
      }
    } catch (err) {
      console.error("Error updating driver:", err);
      setError(
        "An error occurred while updating the driver. Check the console for details."
      );
    } finally {
      setLoading(false);
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
          href={`/drivers/${driverId}`}
          className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          Back to Driver
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
      <h1 className="text-2xl font-bold mb-6">Edit Driver</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="first_name"
            >
              First Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="first_name"
              name="first_name"
              type="text"
              value={driverForm.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="last_name"
              name="last_name"
              type="text"
              value={driverForm.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="vehicle_id"
            >
              Assigned Vehicle
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="vehicle_id"
              name="vehicle_id"
              value={driverForm.vehicle_id}
              onChange={handleChange}
            >
              <option value="">None (Unassigned)</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/drivers/${driverId}`}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
