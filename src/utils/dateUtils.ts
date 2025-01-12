/**
 * Date and time formatting utilities for consistent display across the application.
 * All functions handle empty strings and invalid dates gracefully.
 */

/**
 * Format a date string into a human-readable format (e.g., "January 1, 2024")
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format a time string (HH:mm) into a human-readable format (e.g., "2:30 PM")
 */
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return "";

  try {
    // Create a date object with the time string
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

/**
 * Check if a date is in the past
 */
export const isDatePast = (dateStr: string, timeStr?: string): boolean => {
  if (!dateStr) return false;

  try {
    // If time is provided, use it; otherwise use end of day
    const dateTime = timeStr
      ? new Date(`${dateStr}T${timeStr}`)
      : new Date(`${dateStr}T23:59:59`);

    if (isNaN(dateTime.getTime())) return false;

    const now = new Date();
    return dateTime < now;
  } catch (error) {
    console.error("Error checking if date is past:", error);
    return false;
  }
};

/**
 * Format a date range into a human-readable string
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return "";

  try {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    if (!formattedStart || !formattedEnd) return "";

    // If start and end dates are the same, just return one date
    if (formattedStart === formattedEnd) {
      return formattedStart;
    }

    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "";
  }
};

/**
 * Format a time range into a human-readable string
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";

  try {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);

    if (!formattedStart || !formattedEnd) return "";

    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.error("Error formatting time range:", error);
    return "";
  }
};
