import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

export interface FlyerScannerProps {
  open: boolean;
  onClose: () => void;
}

export const FlyerScanner: React.FC<FlyerScannerProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Scan Event Flyer</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">
            Flyer scanning functionality will be implemented here.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
