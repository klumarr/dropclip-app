import React, { useState } from "react";
import { Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CreateEventDialog } from "./CreateEventDialog";

export const CreateEventButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setIsDialogOpen(true)}
      >
        Create Event
      </Button>

      <CreateEventDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default CreateEventButton;
