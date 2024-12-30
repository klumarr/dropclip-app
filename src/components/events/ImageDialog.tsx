import { Dialog, DialogContent } from "@mui/material";

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
}

const ImageDialog = ({ open, onClose, imageUrl }: ImageDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <img
          src={imageUrl}
          alt="Event Flyer"
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "contain",
            cursor: "pointer",
          }}
          onClick={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
