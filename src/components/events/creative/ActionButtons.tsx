import React from "react";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  DocumentScanner as ScannerIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface ActionButtonsProps {
  onCreateClick: () => void;
  onScanClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateClick,
  onScanClick,
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const actions = [
    {
      icon: <AddIcon />,
      name: "Create Event",
      onClick: () => {
        onCreateClick();
        handleClose();
      },
    },
    {
      icon: <ScannerIcon />,
      name: "Scan Flyer",
      onClick: () => {
        onScanClick();
        handleClose();
      },
    },
  ];

  return (
    <SpeedDial
      ariaLabel="Event Actions"
      sx={{
        position: "fixed",
        bottom: theme.spacing(10),
        right: theme.spacing(2),
        "& .MuiSpeedDial-fab": {
          bgcolor: theme.palette.primary.main,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        },
        "& .MuiSpeedDialAction-staticTooltip": {
          whiteSpace: "nowrap",
          backgroundColor: "transparent",
          display: open ? "flex" : "none",
        },
        "& .MuiSpeedDialAction-staticTooltipLabel": {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
        },
        "& .MuiSpeedDialAction-fab": {
          opacity: open ? 1 : 0,
          transition: `${theme.transitions.create("opacity", {
            duration: theme.transitions.duration.shortest,
          })}, ${theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest,
          })}`,
          transform: open ? "scale(1)" : "scale(0)",
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
      }}
      icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="up"
      FabProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        },
      }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={action.onClick}
          sx={{
            bgcolor: "background.paper",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default ActionButtons;
