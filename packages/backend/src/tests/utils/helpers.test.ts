import {
  formatDate,
  calculateDuration,
  formatDistance,
  isUUID,
  parseId,
} from "../../utils/helpers";

describe("Helper Functions", () => {
  describe("formatDate", () => {
    it("should format a Date object", () => {
      // Create a specific date for consistent testing
      const date = new Date(2023, 0, 15, 10, 30, 0); // Jan 15, 2023, 10:30:00
      const result = formatDate(date);

      // This should return a localized string representation
      expect(typeof result).toBe("string");
      expect(result).not.toBe("N/A");
    });

    it("should format a date string", () => {
      const dateStr = "2023-01-15T10:30:00Z";
      const result = formatDate(dateStr);

      expect(typeof result).toBe("string");
      expect(result).not.toBe("N/A");
    });

    it("should return 'N/A' for null input", () => {
      expect(formatDate(null)).toBe("N/A");
    });
  });

  describe("calculateDuration", () => {
    it("should calculate duration between two dates in hours and minutes", () => {
      const start = new Date(2023, 0, 15, 10, 0, 0); // Jan 15, 2023, 10:00:00
      const end = new Date(2023, 0, 15, 12, 30, 0); // Jan 15, 2023, 12:30:00

      const result = calculateDuration(start, end);

      // Should be "2h 30m"
      expect(result).toBe("2h 30m");
    });

    it("should handle string date inputs", () => {
      const start = "2023-01-15T10:00:00Z";
      const end = "2023-01-15T12:30:00Z";

      const result = calculateDuration(start, end);

      // This might vary based on timezone, but should contain hours and minutes
      expect(result).toMatch(/\d+h \d+m/);
    });

    it("should show just minutes when duration is less than an hour", () => {
      const start = new Date(2023, 0, 15, 10, 0, 0);
      const end = new Date(2023, 0, 15, 10, 45, 0); // 45 minutes later

      const result = calculateDuration(start, end);

      expect(result).toBe("45m");
    });

    it("should return 'In progress' when no end date is provided", () => {
      const start = new Date(2023, 0, 15, 10, 0, 0);

      expect(calculateDuration(start)).toBe("In progress");
      expect(calculateDuration(start, null)).toBe("In progress");
    });
  });

  describe("formatDistance", () => {
    it("should format a distance value with default unit (km)", () => {
      expect(formatDistance(12.345)).toBe("12.35 km");
    });

    it("should format a distance value with custom unit", () => {
      expect(formatDistance(12.345, "miles")).toBe("12.35 miles");
    });

    it("should return 'N/A' for null or undefined distance", () => {
      expect(formatDistance(null)).toBe("N/A");
      expect(formatDistance(undefined)).toBe("N/A");
    });
  });

  describe("isUUID", () => {
    it("should return true for valid UUIDs", () => {
      expect(isUUID("123e4567-e89b-42d3-a456-556642440000")).toBe(true);
      expect(isUUID("a1a2a3a4-b1b2-4c3d-9d8e-f4f3f2f1f000")).toBe(true);
    });

    it("should return false for invalid UUIDs", () => {
      expect(isUUID("not-a-uuid")).toBe(false);
      expect(isUUID("123e4567-e89b-12d3-a456-556642440000")).toBe(false); // Wrong version
      expect(isUUID("123e4567-e89b-42d3-a456-55664244000Z")).toBe(false); // Invalid character
    });
  });

  describe("parseId", () => {
    it("should parse valid numeric strings to numbers", () => {
      expect(parseId("123")).toBe(123);
      expect(parseId("0")).toBe(0);
    });

    it("should return null for invalid numeric strings", () => {
      expect(parseId("abc")).toBeNull();
      expect(parseId("")).toBeNull();
    });
  });
});
