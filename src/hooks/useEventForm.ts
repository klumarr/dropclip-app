import { useState, useCallback } from "react";
import { EventFormData, UploadConfig } from "../types/events";

export const useEventForm = (initialData: EventFormData) => {
  const [formData, setFormData] = useState<EventFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for the changed field
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);

  const handleUploadConfigChange = useCallback(
    (field: keyof UploadConfig, value: any) => {
      setFormData((prev) => ({
        ...prev,
        uploadConfig: {
          ...prev.uploadConfig,
          [field]:
            field === "allowedTypes" && typeof value === "string"
              ? value.split(",").map((type) => type.trim())
              : value,
        },
      }));
      // Clear error for the changed field
      setErrors((prev) => ({
        ...prev,
        [`uploadConfig.${field}`]: "",
      }));
    },
    []
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.location) newErrors.location = "Location is required";

    // Upload config validation
    if (formData.uploadConfig.enabled) {
      if (!formData.uploadConfig.startDate)
        newErrors["uploadConfig.startDate"] = "Start date is required";
      if (!formData.uploadConfig.endDate)
        newErrors["uploadConfig.endDate"] = "End date is required";
      if (formData.uploadConfig.maxFileSize <= 0)
        newErrors["uploadConfig.maxFileSize"] =
          "Max file size must be greater than 0";
      if (!formData.uploadConfig.allowedTypes.length)
        newErrors["uploadConfig.allowedTypes"] =
          "At least one file type is required";

      // Date range validation
      if (formData.uploadConfig.startDate && formData.uploadConfig.endDate) {
        const startDate = new Date(formData.uploadConfig.startDate);
        const endDate = new Date(formData.uploadConfig.endDate);
        if (endDate < startDate) {
          newErrors["uploadConfig.endDate"] =
            "End date must be after start date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    setErrors,
    handleChange,
    handleUploadConfigChange,
    validateForm,
  };
};
