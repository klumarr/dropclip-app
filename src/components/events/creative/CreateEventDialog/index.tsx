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
  Typography,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import { EventDetailsForm } from "../EventDetailsForm";
import { UploadConfigForm } from "../UploadConfigForm";
import { EventPreview } from "../EventPreview";
import { LoadingState } from "../../../common/LoadingState";
import { OperationFeedback } from "../../../common/OperationFeedback";
import { useOperation } from "../../../../hooks/useOperation";
import {
  EventDetails,
  UploadConfig,
  EventFormErrors,
  EventFormData,
} from "../../../../types/events";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EventFormData) => Promise<void>;
}

const steps = ["Event Details", "Upload Settings", "Preview"];

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [activeStep, setActiveStep] = useState(0);
  const [details, setDetails] = useState<EventDetails>({
    title: "",
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
    flyerImage: null,
    flyerImageUrl: undefined,
  });
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
    enabled: false,
    startTime: "",
    endTime: "",
    allowedTypes: ["video/*"],
    maxFileSize: 100,
    maxFiles: 1,
  });
  const [errors, setErrors] = useState<EventFormErrors>({});

  const createOperation = useOperation("create", {
    onSuccess: () => {
      handleClose();
    },
  });

  const validateEventDetails = (): boolean => {
    const newErrors: EventFormErrors = {};

    if (!details.title) newErrors.title = "Title is required";
    if (!details.description) newErrors.description = "Description is required";
    if (!details.type) newErrors.type = "Event type is required";
    if (!details.date) newErrors.date = "Start date is required";
    if (!details.time) newErrors.time = "Start time is required";
    if (!details.endDate) newErrors.endDate = "End date is required";
    if (!details.endTime) newErrors.endTime = "End time is required";
    if (!details.venue) newErrors.venue = "Venue is required";
    if (!details.city) newErrors.city = "City is required";
    if (!details.country) newErrors.country = "Country is required";

    // Validate end date/time is after start date/time
    if (details.date && details.time && details.endDate && details.endTime) {
      const startDateTime = new Date(`${details.date}T${details.time}`);
      const endDateTime = new Date(`${details.endDate}T${details.endTime}`);

      if (endDateTime <= startDateTime) {
        newErrors.endDate = "End date/time must be after start date/time";
        newErrors.endTime = "End date/time must be after start date/time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUploadConfig = (): boolean => {
    const newErrors: EventFormErrors = {};

    if (uploadConfig.enabled) {
      if (!uploadConfig.startTime)
        newErrors.startTime = "Start time is required";
      if (!uploadConfig.endTime) newErrors.endTime = "End time is required";
      if (uploadConfig.allowedTypes?.length === 0)
        newErrors.allowedTypes = "At least one file type must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = true;

    if (activeStep === 0) {
      isValid = validateEventDetails();
    } else if (activeStep === 1) {
      isValid = validateUploadConfig();
    }

    if (isValid) {
      if (activeStep === steps.length - 1) {
        // Submit form
        await createOperation.executeOperation(
          () => onSubmit({ details, uploadConfig }),
          "Failed to create event"
        );
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setDetails({
      title: "",
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
      flyerImage: null,
      flyerImageUrl: undefined,
    });
    setUploadConfig({
      enabled: false,
      startTime: "",
      endTime: "",
      allowedTypes: ["video/*"],
      maxFileSize: 100,
      maxFiles: 1,
    });
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
            onChange={(newDetails) => setDetails(newDetails)}
          />
        );
      case 1:
        return (
          <UploadConfigForm
            config={uploadConfig}
            errors={errors}
            onChange={(newConfig) => setUploadConfig(newConfig)}
          />
        );
      case 2:
        return <EventPreview details={details} uploadConfig={uploadConfig} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Create New Event
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {createOperation.state.loading ? (
            <LoadingState
              message="Creating event..."
              type="circular"
              variant="contained"
              size="medium"
            />
          ) : (
            getStepContent(activeStep)
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={createOperation.state.loading}
          >
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={createOperation.state.loading}
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={createOperation.state.loading}
          >
            {activeStep === steps.length - 1 ? "Create Event" : "Next"}
          </Button>
        </DialogActions>
      </Dialog>

      <OperationFeedback
        state={createOperation.state}
        type="create"
        onClose={createOperation.reset}
      />
    </>
  );
};
