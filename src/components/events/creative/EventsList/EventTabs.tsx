import React from "react";
import { Tabs, Tab, Box, useTheme, useMediaQuery } from "@mui/material";
import { EventTabsProps } from "./types";

const EventTabs: React.FC<EventTabsProps> = ({
  activeTab,
  onTabChange,
  upcomingCount,
  pastCount,
  automaticCount,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const TabLabel = ({
    label,
    count,
    color,
  }: {
    label: string;
    count: number;
    color: string;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexDirection: isMobile ? "column" : "row",
        fontSize: isMobile ? "0.875rem" : "inherit",
      }}
    >
      <Box
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: isMobile ? "100%" : "auto",
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          bgcolor: color,
          color: "white",
          borderRadius: "12px",
          px: 1,
          py: 0.25,
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          minWidth: "20px",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {count}
      </Box>
    </Box>
  );

  return (
    <Tabs
      value={activeTab}
      onChange={onTabChange}
      variant={isMobile ? "fullWidth" : "standard"}
      sx={{
        mb: 3,
        borderBottom: 1,
        borderColor: "divider",
        "& .MuiTab-root": {
          minWidth: isMobile ? 0 : 90,
          padding: isMobile ? "6px 8px" : "12px 16px",
        },
      }}
    >
      <Tab
        label={
          <TabLabel
            label="Upcoming"
            count={upcomingCount}
            color={theme.palette.primary.main}
          />
        }
      />
      <Tab
        label={
          <TabLabel
            label="Past"
            count={pastCount}
            color={theme.palette.grey[500]}
          />
        }
      />
      <Tab
        label={
          <TabLabel
            label="Automatic"
            count={automaticCount}
            color={theme.palette.secondary.main}
          />
        }
      />
    </Tabs>
  );
};

export default EventTabs;
