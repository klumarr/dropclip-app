import { useState, useCallback, useEffect } from "react";
import {
  EventFormData,
  EventFormErrors,
  initialEventFormData,
  UploadConfig,
} from "../types/events";
import { useEvents } from "../contexts/EventsContext";
import { useImageUpload } from "./useImageUpload";

export const useEventForm = (initialData?: EventFormData) => {
  const { newEvent } = useEvents();
  const [formData, setFormData] = useState<EventFormData>(
    initialData || initialEventFormData
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { handleImageUpload } = useImageUpload("events");

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

  const handleUploadConfigChange = useCallback((newConfig: UploadConfig) => {
    setFormData((prev) => ({
      ...prev,
      uploadConfig: newConfig,
    }));
    setIsDirty(true);
  }, []);

  const handleImageChange = useCallback(
    async (file?: File) => {
      try {
        if (file) {
          const flyerUrl = await handleImageUpload(file);
          setFormData((prev) => ({
            ...prev,
            flyerImage: file,
            flyerUrl,
          }));
          console.log("Form data updated with new image:", { file, flyerUrl });
        } else {
          setFormData((prev) => ({
            ...prev,
            flyerImage: null,
            flyerUrl: undefined,
          }));
          console.log("Form data cleared of image");
        }
        setIsDirty(true);
      } catch (error) {
        console.error("Failed to handle image change:", error);
      }
    },
    [handleImageUpload]
  );

  const validateForm = useCallback(() => {
    const newErrors: EventFormErrors = {};

    // Required fields
    if (!formData.name) newErrors.name = "Event name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.country) newErrors.country = "Country is required";

    // Upload config validation
    if (formData.uploadConfig.enabled) {
      const uploadConfigErrors: Record<string, string> = {};

      if (!formData.uploadConfig.startDate) {
        uploadConfigErrors.startDate = "Start date is required";
      }
      if (!formData.uploadConfig.endDate) {
        uploadConfigErrors.endDate = "End date is required";
      }

      if (Object.keys(uploadConfigErrors).length > 0) {
        newErrors.uploadConfig = uploadConfigErrors;
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
