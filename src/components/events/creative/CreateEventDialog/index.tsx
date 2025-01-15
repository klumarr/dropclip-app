import React, { useState } from "react";
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
  EventFormData,
  EventFormErrors,
  UploadConfig,
} from "../../../../types/events";
import { EventDetailsForm } from "../EventDetailsForm";
import { UploadConfigForm } from "../UploadConfigForm";
import { EventPreview } from "../EventPreview";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EventFormData) => Promise<void>;
}

const initialEventDetails: EventDetails = {
  name: "",
  description: "",
  type: "Other",
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
};

const initialUploadConfig: UploadConfig = {
  enabled: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxFileSize: 10,
  allowedTypes: ["video/mp4", "video/quicktime"],
  maxFiles: 5,
};

const steps = ["Event Details", "Upload Settings", "Preview"];

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<EventDetails>(initialEventDetails);
  const [uploadConfig, setUploadConfig] =
    useState<UploadConfig>(initialUploadConfig);
  const [errors, setErrors] = useState<EventFormErrors>({});

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
    const newErrors: EventFormErrors = {
      uploadConfig: {},
    };

    if (uploadConfig.enabled) {
      if (!uploadConfig.startTime) {
        newErrors.uploadConfig.startTime = "Upload start time is required";
      }
      if (!uploadConfig.endTime) {
        newErrors.uploadConfig.endTime = "Upload end time is required";
      }
      if (uploadConfig.maxFileSize <= 0) {
        newErrors.uploadConfig.maxFileSize =
          "Max file size must be greater than 0";
      }
      if (uploadConfig.maxFiles <= 0) {
        newErrors.uploadConfig.maxFiles = "Max files must be greater than 0";
      }
    }

    setErrors(newErrors);
    return (
      !newErrors.uploadConfig ||
      Object.keys(newErrors.uploadConfig).length === 0
    );
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
      await onSubmit({
        name: details.name,
        description: details.description,
        date: details.date,
        time: details.time,
        endDate: details.endDate,
        endTime: details.endTime,
        venue: details.venue,
        city: details.city,
        country: details.country,
        type: details.type,
        ticketLink: details.ticketLink,
        flyerImage: details.flyerImage,
        flyerUrl: details.flyerUrl,
        uploadConfig,
      });
      handleClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setDetails(initialEventDetails);
    setUploadConfig(initialUploadConfig);
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
      <DialogTitle>Create New Event</DialogTitle>
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
            Create Event
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
