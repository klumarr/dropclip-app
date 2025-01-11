import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { attendanceService } from "../services/attendance.service";

export const useAttendanceStatus = (eventId: string) => {
  const { user } = useAuth();
  const [isAttending, setIsAttending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial attendance status
  const checkAttendanceStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const status = await attendanceService.checkAttendanceStatus(
        user.id,
        eventId
      );
      setIsAttending(status);
    } catch (err) {
      console.error("Error checking attendance status:", err);
    }
  }, [user?.id, eventId]);

  // Load initial status
  useEffect(() => {
    checkAttendanceStatus();
  }, [checkAttendanceStatus]);

  // Toggle attendance status
  const toggleAttendance = async () => {
    if (!user?.id) {
      setError("Please sign in to mark attendance");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAttending) {
        await attendanceService.unmarkAttendance(user.id, eventId);
        setIsAttending(false);
      } else {
        await attendanceService.markAttendance(user.id, eventId);
        setIsAttending(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update attendance status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isAttending,
    isLoading,
    error,
    toggleAttendance,
    clearError,
    checkAttendanceStatus,
  };
};

export default useAttendanceStatus;
