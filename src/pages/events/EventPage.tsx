import React from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import MetaTags from "../../components/common/MetaTags";
import { useEvent } from "../../hooks/useEvent";

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error } = useEvent(id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !event) {
    return <div>Error loading event</div>;
  }

  return (
    <>
      <MetaTags event={event} />
      <Container maxWidth="lg">
        {/* Rest of your event page content */}
      </Container>
    </>
  );
};

export default EventPage;
