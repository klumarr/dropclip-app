import React from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  CircularProgress,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { LoadingState } from "./LoadingState";

export type OperationType =
  | "create"
  | "update"
  | "delete"
  | "upload"
  | "process"
  | "share";

export interface OperationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  progress?: number;
}

interface OperationFeedbackProps {
  state: OperationState;
  type: OperationType;
  onClose: () => void;
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  autoHideDuration?: number;
}

const defaultMessages = {
  create: {
    loading: "Creating...",
    success: "Created successfully",
    error: "Failed to create",
  },
  update: {
    loading: "Updating...",
    success: "Updated successfully",
    error: "Failed to update",
  },
  delete: {
    loading: "Deleting...",
    success: "Deleted successfully",
    error: "Failed to delete",
  },
  upload: {
    loading: "Uploading...",
    success: "Uploaded successfully",
    error: "Failed to upload",
  },
  process: {
    loading: "Processing...",
    success: "Processed successfully",
    error: "Failed to process",
  },
  share: {
    loading: "Sharing...",
    success: "Shared successfully",
    error: "Failed to share",
  },
};

export const OperationFeedback: React.FC<OperationFeedbackProps> = ({
  state,
  type,
  onClose,
  messages = {},
  autoHideDuration = 6000,
}) => {
  const theme = useTheme();
  const { loading, success, error, progress } = state;

  const getMessage = (status: "loading" | "success" | "error") => {
    return (
      messages[status] ||
      defaultMessages[type][status] ||
      defaultMessages.create[status]
    );
  };

  if (loading) {
    return (
      <Snackbar
        open={true}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          icon={false}
          sx={{
            width: "100%",
            alignItems: "center",
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 200,
            }}
          >
            <CircularProgress
              size={24}
              variant={progress !== undefined ? "determinate" : "indeterminate"}
              value={progress}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{getMessage("loading")}</Typography>
              {progress !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              )}
            </Box>
          </Box>
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Snackbar
      open={success || !!error}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={error ? "error" : "success"}
        variant="filled"
        sx={{ width: "100%" }}
      >
        <AlertTitle>{error ? "Error" : "Success"}</AlertTitle>
        {error ? error : getMessage("success")}
      </Alert>
    </Snackbar>
  );
};
