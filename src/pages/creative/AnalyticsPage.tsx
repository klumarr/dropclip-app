import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  Timeline,
  TrendingUp,
  People,
  PlayArrow,
  ThumbUp,
  Share,
} from "@mui/icons-material";

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalFollowers: number;
  viewsGrowth: number;
  followersGrowth: number;
}

interface AnalyticsMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  icon: React.ReactElement;
}

interface DataPoint {
  date: string;
  value: number;
}

// Interface for future implementation of time-series analytics data
// Will be used when integrating with the backend API
// @todo: Implement data fetching and time-series visualization
// Example usage:
// const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
//   views: [],
//   likes: [],
//   shares: [],
//   comments: [],
//   followers: [],
//   revenue: [],
// });
export interface AnalyticsData {
  views: DataPoint[];
  likes: DataPoint[];
  shares: DataPoint[];
  comments: DataPoint[];
  followers: DataPoint[];
  revenue: DataPoint[];
}

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState("7days");

  // Mock data - replace with actual data from API
  const summary: AnalyticsSummary = {
    totalViews: 12500,
    totalLikes: 850,
    totalShares: 230,
    totalFollowers: 1200,
    viewsGrowth: 15,
    followersGrowth: 8,
  };

  const metrics: AnalyticsMetric[] = [
    {
      id: "views",
      title: "Total Views",
      value: summary.totalViews,
      change: summary.viewsGrowth,
      icon: <PlayArrow />,
    },
    {
      id: "followers",
      title: "Followers",
      value: summary.totalFollowers,
      change: summary.followersGrowth,
      icon: <People />,
    },
    {
      id: "likes",
      title: "Total Likes",
      value: summary.totalLikes,
      change: 12,
      icon: <ThumbUp />,
    },
    {
      id: "shares",
      title: "Total Shares",
      value: summary.totalShares,
      change: 5,
      icon: <Share />,
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getChangeColor = (change: number): string => {
    return change > 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "primary.main",
                  }}
                >
                  {metric.icon}
                  <Typography
                    variant="subtitle1"
                    sx={{ ml: 1, fontWeight: "medium" }}
                  >
                    {metric.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(metric.value)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    color: getChangeColor(metric.change),
                  }}
                >
                  <TrendingUp fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Performance Over Time
        </Typography>
        <Card>
          <CardContent>
            <Box
              sx={{
                width: "100%",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Timeline sx={{ fontSize: 64, color: "text.secondary" }} />
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                Chart component will be implemented here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
