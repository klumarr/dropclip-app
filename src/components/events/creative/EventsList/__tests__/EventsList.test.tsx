import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { EventsProvider } from "../../../../../contexts/EventsContext";
import EventsList from "../index";
import theme from "../../../../../theme";

// Mock the useEvents hook
jest.mock("../../../contexts/EventsContext", () => ({
  useEvents: () => ({
    events: {
      upcoming: [
        {
          id: "1",
          title: "Test Event",
          date: "2024-01-01",
          location: "Test Location",
          description: "Test Description",
          user_id: "123",
          startTime: "10:00",
          endTime: "11:00",
          ticketLink: "",
          imageUrl: "",
          isAutomatic: false,
          uploadConfig: {
            enabled: false,
            allowedTypes: ["image/*"],
            maxFileSize: 100,
          },
        },
      ],
      past: [],
      automatic: [],
    },
    isLoading: false,
    handleEditEvent: jest.fn(),
    handleDeleteEvent: jest.fn(),
  }),
}));

describe("EventsList", () => {
  const renderComponent = () =>
    render(
      <ThemeProvider theme={theme}>
        <EventsProvider>
          <EventsList />
        </EventsProvider>
      </ThemeProvider>
    );

  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByText("Automatic")).toBeInTheDocument();
  });

  it("displays event information correctly", () => {
    renderComponent();
    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
  });

  it("switches tabs correctly", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Past"));
    expect(screen.getByRole("tab", { name: "Past" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
