import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserType } from "../types/auth.types";
import EventsPageCreative from "./creative/EventsPageCreative";
import EventsPageFan from "./fan/EventsPageFan";
import { LoadingState } from "../components/common/LoadingState";
import { Container, Typography } from "@mui/material";

const EventsPage: React.FC = () => {
  const { userAttributes, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (!userAttributes) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" align="center">
          Please sign in to view events
        </Typography>
      </Container>
    );
  }

  switch (userAttributes.userType) {
    case UserType.CREATIVE:
      return <EventsPageCreative />;
    case UserType.FAN:
      return <EventsPageFan />;
    default:
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6" color="error" align="center">
            Invalid user type
          </Typography>
        </Container>
      );
  }
};

export default EventsPage;
