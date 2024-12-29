import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { UserType } from "../types/auth.types";

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === UserType.CREATIVE;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isCreative ? "Find Fans & Events" : "Discover Creatives & Events"}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={
          isCreative
            ? "Search fans or events..."
            : "Search creatives or events..."
        }
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: isLoading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {/* Search results will be rendered here */}
        <Grid item xs={12}>
          <Typography variant="body1" color="text.secondary" align="center">
            {searchQuery
              ? "No results found. Try a different search term."
              : "Start typing to search..."}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
