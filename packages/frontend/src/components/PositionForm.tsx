import { useState } from "react";
import { useRouter } from "next/navigation";
import { positionsApi, handleApiRequest, ApiError } from "@/services/api";
import { PositionInput } from "shared/types";
import { toast } from "react-hot-toast";
import { ErrorMessage } from "./ErrorHandler";

interface PositionFormProps {
  vehicleId: number;
  onSuccess?: () => void;
}

export default function PositionForm({
  vehicleId,
  onSuccess,
}: PositionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [formData, setFormData] = useState<Partial<PositionInput>>({
    vehicle_id: vehicleId,
    latitude: undefined,
    longitude: undefined,
    speed: 0,
    ignition: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else if (
      name === "latitude" ||
      name === "longitude" ||
      name === "speed"
    ) {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate position data
    if (formData.latitude === undefined || formData.longitude === undefined) {
      toast.error("Latitude and longitude are required");
      setLoading(false);
      return;
    }

    // Use the handleApiRequest helper with positionsApi
    try {
      const result = await handleApiRequest(
        () => positionsApi.create(formData as PositionInput),
        (data) => {
          // Success handler
          toast.success("Position updated successfully");
          if (onSuccess) {
            onSuccess();
          } else {
            router.refresh();
          }
        },
        (apiError) => {
          // Error handler
          console.error("API Error:", apiError);
          setError(apiError);
          toast.error(apiError.getUserFriendlyMessage());
        }
      );

      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <h2 className="text-xl font-bold mb-4">Update Position</h2>

      {error && <ErrorMessage error={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            id="latitude"
            name="latitude"
            value={formData.latitude || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            id="longitude"
            name="longitude"
            value={formData.longitude || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="speed"
            className="block text-sm font-medium text-gray-700"
          >
            Speed (km/h)
          </label>
          <input
            type="number"
            id="speed"
            name="speed"
            value={formData.speed || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center h-full mt-6">
          <input
            type="checkbox"
            id="ignition"
            name="ignition"
            checked={formData.ignition || false}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="ignition"
            className="ml-2 block text-sm text-gray-700"
          >
            Ignition On
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update Position"}
        </button>
      </div>
    </form>
  );
}
