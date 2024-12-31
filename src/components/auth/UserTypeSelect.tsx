import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  useTheme,
} from "@mui/material";
import { Person, MusicNote } from "@mui/icons-material";
import { UserType, CreativeCategory } from "../../types/auth.types";

const SelectCard = styled(Card)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: `2px solid ${
      selected ? theme.palette.primary.main : "transparent"
    }`,
    backgroundColor: selected
      ? theme.palette.action.selected
      : theme.palette.background.paper,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    },
  })
);

interface UserTypeSelectProps {
  selectedType: UserType | null;
  selectedCreativeType?: CreativeCategory;
  customCreativeType?: string;
  onSelect: (type: UserType) => void;
  onCreativeTypeSelect?: (type: CreativeCategory) => void;
  onCustomCreativeTypeChange?: (value: string) => void;
}

export const UserTypeSelect: React.FC<UserTypeSelectProps> = ({
  selectedType,
  selectedCreativeType,
  customCreativeType,
  onSelect,
  onCreativeTypeSelect,
  onCustomCreativeTypeChange,
}) => {
  const theme = useTheme();

  console.log("UserTypeSelect props:", {
    selectedType,
    selectedCreativeType,
    customCreativeType,
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        sx={{
          fontSize: { xs: "1.125rem", sm: "1.25rem" },
          mb: { xs: 1, sm: 2 },
        }}
      >
        Choose Your Role
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{
          mb: { xs: 2, sm: 4 },
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        Select how you want to use DropClip. Don't worry, you can always change
        this later.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
          gap: { xs: 1.5, sm: 3 },
        }}
      >
        <SelectCard
          selected={selectedType === UserType.FAN}
          onClick={() => onSelect(UserType.FAN)}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: { xs: 1.5, sm: 3 },
            }}
          >
            <Person
              sx={{
                fontSize: { xs: 32, sm: 48 },
                color: theme.palette.primary.main,
                mb: { xs: 1, sm: 2 },
              }}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Fan
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                display: { xs: "-webkit-box", sm: "block" },
                WebkitLineClamp: { xs: 3, sm: "none" },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Follow your favorite artists, share event videos, and be part of
              the community.
            </Typography>
          </CardContent>
        </SelectCard>

        <SelectCard
          selected={selectedType === UserType.CREATIVE}
          onClick={() => onSelect(UserType.CREATIVE)}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: { xs: 1.5, sm: 3 },
            }}
          >
            <MusicNote
              sx={{
                fontSize: { xs: 32, sm: 48 },
                color: theme.palette.secondary.main,
                mb: { xs: 1, sm: 2 },
              }}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Creative
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                display: { xs: "-webkit-box", sm: "block" },
                WebkitLineClamp: { xs: 3, sm: "none" },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Share your events, collect fan videos, and grow your audience.
            </Typography>
          </CardContent>
        </SelectCard>
      </Box>

      {selectedType === UserType.CREATIVE && onCreativeTypeSelect && (
        <Box sx={{ mt: { xs: 2, sm: 4 } }}>
          <FormControl fullWidth size="small">
            <InputLabel id="creative-type-label">Creative Type</InputLabel>
            <Select
              labelId="creative-type-label"
              value={selectedCreativeType || ""}
              label="Creative Type"
              onChange={(e) =>
                onCreativeTypeSelect(e.target.value as CreativeCategory)
              }
            >
              {Object.values(CreativeCategory).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCreativeType === CreativeCategory.OTHER &&
            onCustomCreativeTypeChange && (
              <TextField
                fullWidth
                size="small"
                label="Specify Your Creative Type"
                value={customCreativeType || ""}
                onChange={(e) => onCustomCreativeTypeChange(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{
          mt: { xs: 2, sm: 3 },
          display: "block",
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        {selectedType === UserType.CREATIVE
          ? "As a Creative, you'll also get a Fan account to engage with other artists."
          : selectedType === UserType.FAN
          ? "As a Fan, you can activate a Creative account later if needed."
          : "Select a role to continue"}
      </Typography>
    </Box>
  );
};
