import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSignInModal } from "../../hooks/useSignInModal";
import SignInForm from "../auth/SignInForm";

export const SignInModal: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isOpen, closeSignInModal, handleSuccess } = useSignInModal();

  console.log("🔐 SignInModal:", { isOpen });

  return (
    <Dialog
      open={isOpen}
      onClose={closeSignInModal}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "background.paper",
          backgroundImage: "none",
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        Sign In to Continue
        <IconButton
          onClick={closeSignInModal}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
          <SignInForm onSuccess={handleSuccess} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
