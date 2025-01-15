import { EventFormData, UploadConfig } from "../types/events";

// Constants for validation
export const VALIDATION_RULES = {
  NAME: {
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
  time: string,
  endTime: string,
  date: string
): boolean => {
  if (!time || !endTime || !date) return false;

  const startDateTime = new Date(`${date}T${time}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  return endDateTime > startDateTime;
};

// Helper function to validate image file
export const isValidImageFile = (file: File | null | undefined): boolean => {
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
    if (!config.startTime) {
      errors["uploadConfig.startTime"] = "Start time is required";
    }
    if (!config.endTime) {
      errors["uploadConfig.endTime"] = "End time is required";
    }
    if (config.startTime && config.endTime) {
      const startTime = new Date(`1970-01-01T${config.startTime}`);
      const endTime = new Date(`1970-01-01T${config.endTime}`);
      if (endTime <= startTime) {
        errors["uploadConfig.endTime"] = "End time must be after start time";
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

  // Name validation
  if (!formData.name) {
    errors.name = "Name is required";
  } else if (formData.name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.name = `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`;
  } else if (formData.name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    errors.name = `Name cannot exceed ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`;
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
  if (!formData.time) {
    errors.time = "Time is required";
  } else if (!isValidTime(formData.time)) {
    errors.time = "Invalid time format";
  }

  if (!formData.endTime) {
    errors.endTime = "End time is required";
  } else if (!isValidTime(formData.endTime)) {
    errors.endTime = "Invalid end time format";
  }

  // Time range validation
  if (formData.time && formData.endTime && formData.date) {
    if (!isValidTimeRange(formData.time, formData.endTime, formData.date)) {
      errors.endTime = "End time must be after time";
    }
  }

  // Venue validation
  if (!formData.venue) {
    errors.venue = "Venue is required";
  }

  // City validation
  if (!formData.city) {
    errors.city = "City is required";
  }

  // Country validation
  if (!formData.country) {
    errors.country = "Country is required";
  }

  // Ticket link validation
  if (formData.ticketLink && !isValidUrl(formData.ticketLink)) {
    errors.ticketLink = "Invalid ticket link URL";
  }

  // Image validation
  if (formData.flyerImage && !isValidImageFile(formData.flyerImage)) {
    errors.flyerImage = `Invalid image file. Must be JPG, PNG, or GIF under ${
      VALIDATION_RULES.IMAGE.MAX_SIZE / (1024 * 1024)
    }MB`;
  }

  // Upload config validation
  const uploadConfigErrors = validateUploadConfig(formData.uploadConfig);
  Object.assign(errors, uploadConfigErrors);

  return errors;
};
