import { EventFormData, UploadConfig } from "../types/events";

// Constants for validation
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  TICKET_LINK: {
    URL_PATTERN: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  },
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif"],
  },
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE: {
      MIN: 1,
      MAX: 500, // 500MB
    },
  },
};

// Helper function to validate URLs
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  return VALIDATION_RULES.TICKET_LINK.URL_PATTERN.test(url);
};

// Helper function to validate dates
export const isValidDate = (date: string): boolean => {
  if (!date) return false;
  const selectedDate = new Date(date);
  return selectedDate instanceof Date && !isNaN(selectedDate.getTime());
};

// Helper function to validate time format
export const isValidTime = (time: string): boolean => {
  if (!time) return false;
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// Helper function to validate time range
export const isValidTimeRange = (
  startTime: string,
  endTime: string,
  date: string
): boolean => {
  if (!startTime || !endTime || !date) return false;

  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  return endDateTime > startDateTime;
};

// Helper function to validate image file
export const isValidImageFile = (file: File | undefined): boolean => {
  if (!file) return true; // Optional field
  return (
    VALIDATION_RULES.IMAGE.ALLOWED_TYPES.includes(file.type) &&
    file.size <= VALIDATION_RULES.IMAGE.MAX_SIZE
  );
};

// Helper function to validate upload config
export const validateUploadConfig = (
  config: UploadConfig
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (config.enabled) {
    if (!config.startDate) {
      errors["uploadConfig.startDate"] = "Start date is required";
    }
    if (!config.endDate) {
      errors["uploadConfig.endDate"] = "End date is required";
    }
    if (config.startDate && config.endDate) {
      const startDate = new Date(config.startDate);
      const endDate = new Date(config.endDate);
      if (endDate <= startDate) {
        errors["uploadConfig.endDate"] = "End date must be after start date";
      }
    }
    if (config.maxFileSize < VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MIN) {
      errors["uploadConfig.maxFileSize"] = "File size must be at least 1MB";
    }
    if (config.maxFileSize > VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MAX) {
      errors["uploadConfig.maxFileSize"] = "File size cannot exceed 500MB";
    }
    if (!config.allowedTypes.length) {
      errors["uploadConfig.allowedTypes"] =
        "At least one file type must be allowed";
    }
  }

  return errors;
};

// Main validation function for event form
export const validateEventForm = (
  formData: EventFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!formData.title) {
    errors.title = "Title is required";
  } else if (formData.title.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
    errors.title = `Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`;
  } else if (formData.title.length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
    errors.title = `Title cannot exceed ${VALIDATION_RULES.TITLE.MAX_LENGTH} characters`;
  }

  // Description validation
  if (!formData.description) {
    errors.description = "Description is required";
  } else if (
    formData.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
  ) {
    errors.description = `Description must be at least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters`;
  } else if (
    formData.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH
  ) {
    errors.description = `Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`;
  }

  // Date validation
  if (!formData.date) {
    errors.date = "Date is required";
  } else if (!isValidDate(formData.date)) {
    errors.date = "Invalid date format";
  }

  // Time validation
  if (!formData.startTime) {
    errors.startTime = "Start time is required";
  } else if (!isValidTime(formData.startTime)) {
    errors.startTime = "Invalid start time format";
  }

  if (!formData.endTime) {
    errors.endTime = "End time is required";
  } else if (!isValidTime(formData.endTime)) {
    errors.endTime = "Invalid end time format";
  }

  // Time range validation
  if (formData.startTime && formData.endTime && formData.date) {
    if (
      !isValidTimeRange(formData.startTime, formData.endTime, formData.date)
    ) {
      errors.endTime = "End time must be after start time";
    }
  }

  // Location validation
  if (!formData.location) {
    errors.location = "Location is required";
  }

  // Ticket link validation
  if (formData.ticketLink && !isValidUrl(formData.ticketLink)) {
    errors.ticketLink = "Invalid ticket link URL";
  }

  // Image validation
  if (formData.imageFile && !isValidImageFile(formData.imageFile)) {
    errors.imageFile = `Invalid image file. Must be JPG, PNG, or GIF under ${
      VALIDATION_RULES.IMAGE.MAX_SIZE / (1024 * 1024)
    }MB`;
  }

  // Upload config validation
  const uploadConfigErrors = validateUploadConfig(formData.uploadConfig);
  Object.assign(errors, uploadConfigErrors);

  return errors;
};
