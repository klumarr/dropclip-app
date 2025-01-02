import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserType, CreativeCategory } from "../../types/auth.types";
import { FanIcon, CreativeIcon } from "../../components/icons";

interface UserTypeSelectProps {
  selectedType: UserType | null;
  selectedCreativeType?: CreativeCategory;
  customCreativeType?: string;
  onSelect: (type: UserType) => void;
  onCreativeTypeSelect: (type: CreativeCategory) => void;
  onCustomCreativeTypeChange: (value: string) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  height: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transform: "translateY(-2px)",
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    width: 48,
    height: 48,
  },
}));

export const UserTypeSelect = ({
  selectedType,
  selectedCreativeType,
  customCreativeType = "",
  onSelect,
  onCreativeTypeSelect,
  onCustomCreativeTypeChange,
}: UserTypeSelectProps) => {
  const handleCardClick = (type: UserType) => {
    onSelect(type);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <StyledCard
            onClick={() => handleCardClick(UserType.FAN)}
            className={selectedType === UserType.FAN ? "selected" : ""}
          >
            <CardContent>
              <IconWrapper>
                <FanIcon
                  color={selectedType === UserType.FAN ? "primary" : "inherit"}
                />
              </IconWrapper>
              <Typography variant="h6" gutterBottom align="center">
                Fan
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Discover and connect with your favorite creatives. Get exclusive
                access to events and content.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledCard
            onClick={() => handleCardClick(UserType.CREATIVE)}
            className={selectedType === UserType.CREATIVE ? "selected" : ""}
          >
            <CardContent>
              <IconWrapper>
                <CreativeIcon
                  color={
                    selectedType === UserType.CREATIVE ? "primary" : "inherit"
                  }
                />
              </IconWrapper>
              <Typography variant="h6" gutterBottom align="center">
                Creative
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Share your talent with the world. Create events, manage your
                content, and grow your audience.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {selectedType === UserType.CREATIVE && (
        <Box sx={{ mt: 3 }}>
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
