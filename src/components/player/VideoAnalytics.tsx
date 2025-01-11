import { Box, Typography, Paper, Grid, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
  viewCount: number;
}

interface VideoAnalyticsProps {
  views: number;
  retentionRate: number;
  engagementRate: number;
  chapters: Chapter[];
}

export const VideoAnalytics = ({
  views,
  retentionRate,
  engagementRate,
  chapters,
}: VideoAnalyticsProps) => {
  const theme = useTheme();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const chartData = chapters.map((chapter, index) => ({
    name: chapter.title,
    views: chapter.viewCount,
    time: chapter.startTime,
    index,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Video Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{formatNumber(views)}</Typography>
            <Typography color="text.secondary">Total Views</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{`${retentionRate.toFixed(
              1
            )}%`}</Typography>
            <Typography color="text.secondary">Retention Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{`${engagementRate.toFixed(
              1
            )}%`}</Typography>
            <Typography color="text.secondary">Engagement Rate</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Viewer Retention
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: theme.palette.text.primary }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: theme.palette.text.primary }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
              }}
              formatter={(value: number) => [formatNumber(value), "Views"]}
              labelStyle={{ color: theme.palette.text.primary }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
