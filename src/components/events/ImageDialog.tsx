import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const FullSizeImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "90vh",
  objectFit: "contain",
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  right: 8,
  top: 8,
  color: "white",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
}

const ImageDialog = ({ open, onClose, imageUrl }: ImageDialogProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent style={{ padding: 0, position: "relative" }}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <FullSizeImage src={imageUrl} alt="Event" />
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
