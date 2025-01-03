import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UserType, CreativeCategory } from "../../types/auth.types";

interface ProfileAnalyticsProps {
  userId: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
}

interface AnalyticsData {
  followers: number;
  videos: number;
  events: number;
  engagementRate: number;
  growthData: {
    date: string;
    followers: number;
    views: number;
    engagement: number;
  }[];
}

const mockAnalyticsData: AnalyticsData = {
  followers: 1234,
  videos: 45,
  events: 12,
  engagementRate: 8.5,
  growthData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    followers: 1000 + Math.floor(Math.random() * 500),
    views: 5000 + Math.floor(Math.random() * 2000),
    engagement: 5 + Math.random() * 8,
  })),
};

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  userId,
  userType,
  creativeCategory,
}) => {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [analyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [selectedMetric, setSelectedMetric] = useState<string>("followers");

  useEffect(() => {
    // In a real implementation, fetch analytics data from the backend
    console.log(
      `Fetching analytics data for user ${userId} with type ${userType} and category ${creativeCategory}`
    );
  }, [userId, userType, creativeCategory, timeRange]);

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value);
  };

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Profile Analytics</Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Attendees
              </Typography>
              <Typography variant="h4">
                {formatNumber(analyticsData.followers)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Videos
              </Typography>
              <Typography variant="h4">
                {formatNumber(analyticsData.videos)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Events
              </Typography>
              <Typography variant="h4">
                {formatNumber(analyticsData.events)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Typography variant="h4">
                {analyticsData.engagementRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Growth Overview</Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={handleMetricChange}
                label="Metric"
              >
                <MenuItem value="followers">Attendees</MenuItem>
                <MenuItem value="views">Video Views</MenuItem>
                <MenuItem value="engagement">Engagement</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={analyticsData.growthData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) =>
                    new Date(date).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    selectedMetric === "engagement"
                      ? `${value.toFixed(1)}%`
                      : formatNumber(value)
                  }
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
