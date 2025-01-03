import React from "react";
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import { UserType, CreativeCategory } from "../../types/auth.types";
import { CreativeIcon, FanIcon } from "../../components/icons";

interface UserTypeSelectProps {
  selectedType: UserType | null;
  selectedCreativeType?: CreativeCategory;
  customCreativeType: string;
  onSelect: (type: UserType) => void;
  onCreativeTypeSelect: (type: CreativeCategory) => void;
  onCustomCreativeTypeChange: (value: string) => void;
}

export const UserTypeSelect: React.FC<UserTypeSelectProps> = ({
  selectedType,
  selectedCreativeType,
  customCreativeType,
  onSelect,
  onCreativeTypeSelect,
  onCustomCreativeTypeChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Choose your account type
      </Typography>

      <Button
        variant="outlined"
        onClick={() => onSelect(UserType.CREATIVE)}
        startIcon={<CreativeIcon />}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          p: 2,
          backgroundColor:
            selectedType === UserType.CREATIVE
              ? "rgba(255, 255, 255, 0.08)"
              : "transparent",
        }}
      >
        Creative
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect(UserType.FAN)}
        startIcon={<FanIcon />}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          p: 2,
          backgroundColor:
            selectedType === UserType.FAN
              ? "rgba(255, 255, 255, 0.08)"
              : "transparent",
        }}
      >
        Fan
      </Button>

      {selectedType === UserType.CREATIVE && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            What type of creative are you?
          </Typography>
          <RadioGroup
            value={selectedCreativeType || ""}
            onChange={(e) =>
              onCreativeTypeSelect(e.target.value as CreativeCategory)
            }
          >
            {Object.values(CreativeCategory).map((category) => (
              <FormControlLabel
                key={category}
                value={category}
                control={<Radio />}
                label={category === CreativeCategory.OTHER ? "Other" : category}
              />
            ))}
          </RadioGroup>

          {selectedCreativeType === CreativeCategory.OTHER && (
            <TextField
              fullWidth
              placeholder="Specify your creative type"
              value={customCreativeType}
              onChange={(e) => onCustomCreativeTypeChange(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  "&::placeholder": {
                    color: "text.secondary",
                    opacity: 1,
                  },
                },
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserTypeSelect;
