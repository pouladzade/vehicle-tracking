/**
 * Format a date object to a string in local format
 * @param date Date object or string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString();
};

/**
 * Calculate duration between two dates in a readable format
 * @param startDate Start date object or string
 * @param endDate End date object or string (optional)
 * @returns Formatted duration string
 */
export const calculateDuration = (
  startDate: Date | string,
  endDate?: Date | string | null
): string => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;

  if (!endDate) {
    return "In progress";
  }

  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  // Calculate duration in milliseconds
  const durationMs = end.getTime() - start.getTime();

  // Convert to minutes
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  // Format as hours and minutes
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

/**
 * Format a distance value to a readable string
 * @param distance Distance value
 * @param unit Unit of measurement (default: km)
 * @returns Formatted distance string
 */
export const formatDistance = (
  distance: number | null | undefined,
  unit: string = "km"
): string => {
  if (distance === null || distance === undefined) {
    return "N/A";
  }

  return `${distance.toFixed(2)} ${unit}`;
};

/**
 * Check if a string is a valid UUID v4
 * @param str String to check
 * @returns Boolean indicating if string is a valid UUID
 */
export const isUUID = (str: string): boolean => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Parse a stringified ID to a number
 * @param id ID as string
 * @returns Parsed number or null if invalid
 */
export const parseId = (id: string): number | null => {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) ? null : parsedId;
};
