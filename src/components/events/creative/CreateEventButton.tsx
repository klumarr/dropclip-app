import React, { useState } from "react";
import { Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CreateEventDialog } from "./CreateEventDialog";
import { useEvents } from "../../../contexts/EventsContext";
import { EventFormData } from "../../../types/events";

export const CreateEventButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createEvent } = useEvents();

  const handleSubmit = async (formData: EventFormData) => {
    try {
      await createEvent(formData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

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
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CreateEventButton;
