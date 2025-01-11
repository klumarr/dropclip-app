import { useState, useCallback, useEffect } from "react";
import {
  EventFormData,
  EventFormErrors,
  initialEventFormData,
} from "../types/events";
import { useEvents } from "../contexts/EventsContext";

export const useEventForm = (initialData?: EventFormData) => {
  const { newEvent } = useEvents();
  const [formData, setFormData] = useState<EventFormData>(
    initialData || initialEventFormData
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Initialize form with newEvent data when available
  useEffect(() => {
    if (newEvent) {
      setFormData((prevData) => ({
        ...prevData,
        ...newEvent,
      }));
      setIsDirty(true);
    }
  }, [newEvent]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsDirty(false);
      validateForm();
    }
  }, [initialData]);

  const handleChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  const handleUploadConfigChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      uploadConfig: {
        ...prev.uploadConfig,
        [field]: value,
      },
    }));
    setIsDirty(true);
  }, []);

  const handleImageChange = useCallback((file?: File) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: file ? URL.createObjectURL(file) : undefined,
    }));
    setIsDirty(true);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: EventFormErrors = {};

    // Required fields
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.location) newErrors.location = "Location is required";

    // Upload config validation
    if (formData.uploadConfig.enabled) {
      if (!formData.uploadConfig.startDate) {
        newErrors["uploadConfig.startDate"] = "Start date is required";
      }
      if (!formData.uploadConfig.endDate) {
        newErrors["uploadConfig.endDate"] = "End date is required";
      }
    }

    setErrors(newErrors);
    const isFormValid = Object.keys(newErrors).length === 0;
    setIsValid(isFormValid);
    return isFormValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialEventFormData);
    setErrors({});
    setIsDirty(false);
    setIsValid(false);
  }, []);

  return {
    formData,
    errors,
    isDirty,
    isValid,
    handleChange,
    handleUploadConfigChange,
    handleImageChange,
    validateForm,
    resetForm,
  };
};
