import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  EventDetails,
  Event,
  EventFormData,
  EventFormErrors,
} from "../../../../types/events";
import { EventDetailsForm } from "../EventDetailsForm";
import { UploadConfigForm } from "../UploadConfigForm";
import { EventPreview } from "../EventPreview";

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onSubmit: (eventId: string, formData: EventFormData) => Promise<void>;
}

const steps = ["Event Details", "Upload Settings", "Preview"];

export const EditEventDialog: React.FC<EditEventDialogProps> = ({
  event,
  open,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<EventDetails>({
    name: "",
    description: "",
    type: "",
    tags: [],
    suggestedTags: [],
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    venue: "",
    city: "",
    country: "",
    ticketLink: "",
  });
  const [uploadConfig, setUploadConfig] = useState({
    enabled: false,
    startTime: "",
    endTime: "",
    allowedTypes: ["image/*", "video/*"],
    maxFileSize: 10,
    maxFilesPerUser: 5,
  });
  const [errors, setErrors] = useState<EventFormErrors>({});

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setDetails({
        name: event.name,
        description: event.description,
        type: event.type,
        tags: event.tags || [],
        suggestedTags: [],
        date: event.date,
        time: event.time,
        endDate: event.endDate || "",
        endTime: event.endTime || "",
        venue: event.venue,
        city: event.city,
        country: event.country,
        ticketLink: event.ticketLink || "",
        flyerImageUrl: event.flyerUrl,
      });
    }
  }, [event]);

  const validateEventDetails = (): boolean => {
    const newErrors: EventFormErrors = {};

    if (!details.name?.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!details.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!details.type) {
      newErrors.type = "Event type is required";
    }

    if (!details.date) {
      newErrors.date = "Start date is required";
    }

    if (!details.time) {
      newErrors.time = "Start time is required";
    }

    if (!details.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!details.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (!details.venue?.trim()) {
      newErrors.venue = "Venue is required";
    }

    if (!details.city?.trim()) {
      newErrors.city = "City is required";
    }

    if (!details.country?.trim()) {
      newErrors.country = "Country is required";
    }

    // Validate that end date/time is after start date/time
    if (details.date && details.time && details.endDate && details.endTime) {
      const startDateTime = new Date(`${details.date}T${details.time}`);
      const endDateTime = new Date(`${details.endDate}T${details.endTime}`);

      if (endDateTime <= startDateTime) {
        newErrors.endDate = "End date/time must be after start date/time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUploadConfig = (): boolean => {
    const newErrors: EventFormErrors = {};

    if (uploadConfig.enabled) {
      if (!uploadConfig.startTime) {
        newErrors.uploadStartTime = "Upload start time is required";
      }
      if (!uploadConfig.endTime) {
        newErrors.uploadEndTime = "Upload end time is required";
      }
      if (uploadConfig.maxFileSize <= 0) {
        newErrors.maxFileSize = "Max file size must be greater than 0";
      }
      if (uploadConfig.maxFilesPerUser <= 0) {
        newErrors.maxFilesPerUser = "Max files per user must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (activeStep === 0) {
      isValid = validateEventDetails();
    } else if (activeStep === 1) {
      isValid = validateUploadConfig();
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(event.id, {
        name: details.name,
        description: details.description,
        type: details.type,
        tags: details.tags,
        date: details.date,
        time: details.time,
        endDate: details.endDate,
        endTime: details.endTime,
        venue: details.venue,
        city: details.city,
        country: details.country,
        ticketLink: details.ticketLink,
        flyerUrl: details.flyerImageUrl,
      });
      handleClose();
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <EventDetailsForm
            details={details}
            errors={errors}
            onChange={setDetails}
          />
        );
      case 1:
        return (
          <UploadConfigForm
            config={uploadConfig}
            errors={errors}
            onChange={setUploadConfig}
          />
        );
      case 2:
        return <EventPreview details={details} uploadConfig={uploadConfig} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>Edit Event</DialogTitle>
      <DialogContent>
        <Box sx={{ width: "100%", mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 4 }}>{getStepContent(activeStep)}</Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            Save Changes
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
