import {
  CloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";

interface LogContext {
  action: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

interface MetricData {
  name: string;
  value: number;
  unit?: StandardUnit;
  dimensions?: Record<string, string>;
}

class CreativeLoggingService {
  private cloudWatch: CloudWatchClient;
  private cloudWatchLogs: CloudWatchLogsClient;
  private logGroupName: string;
  private namespace: string;

  constructor() {
    this.cloudWatch = new CloudWatchClient({});
    this.cloudWatchLogs = new CloudWatchLogsClient({});
  }

  private async initialize() {
    const { credentials } = await fetchAuthSession();
    if (!credentials) {
      throw new Error("No credentials available");
    }

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("No user available");
    }

    const userId = user.userId;
    this.logGroupName = `/aws/dropclip/creative/${userId}`;
    this.namespace = `DropClip/Creative/${userId}`;
  }

  async logAction(context: LogContext) {
    await this.initialize();
    const timestamp = new Date().getTime();

    try {
      // Log to CloudWatch Logs
      await this.cloudWatchLogs.send(
        new PutLogEventsCommand({
          logGroupName: this.logGroupName,
          logStreamName: new Date().toISOString().split("T")[0], // Daily log stream
          logEvents: [
            {
              timestamp,
              message: JSON.stringify({
                ...context,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        })
      );

      // Track action as metric
      await this.cloudWatch.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: `${context.action}Count`,
              Value: 1,
              Unit: "Count",
              Timestamp: new Date(),
              Dimensions: [
                {
                  Name: "Action",
                  Value: context.action,
                },
                ...(context.resourceId
                  ? [
                      {
                        Name: "ResourceId",
                        Value: context.resourceId,
                      },
                    ]
                  : []),
              ],
            },
          ],
        })
      );
    } catch (error) {
      console.error("Failed to log creative action:", error);
      // Don't throw - logging should not break the main flow
    }
  }

  async trackMetric(data: MetricData) {
    await this.initialize();

    try {
      await this.cloudWatch.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: data.name,
              Value: data.value,
              Unit: data.unit || StandardUnit.Count,
              Timestamp: new Date(),
              Dimensions: data.dimensions
                ? Object.entries(data.dimensions).map(([Name, Value]) => ({
                    Name,
                    Value,
                  }))
                : [],
            },
          ],
        })
      );
    } catch (error) {
      console.error("Failed to track metric:", error);
    }
  }

  // Helper methods for common actions
  async logVideoProcessing(
    videoId: string,
    status: string,
    metadata?: Record<string, any>
  ) {
    await this.logAction({
      action: "VideoProcessing",
      resourceId: videoId,
      metadata: {
        status,
        ...metadata,
      },
    });
  }

  async logEventCreation(eventId: string, metadata?: Record<string, any>) {
    await this.logAction({
      action: "EventCreation",
      resourceId: eventId,
      metadata,
    });
  }

  async logUploadApproval(uploadId: string, metadata?: Record<string, any>) {
    await this.logAction({
      action: "UploadApproval",
      resourceId: uploadId,
      metadata,
    });
  }

  async trackStorageUsage(bytes: number) {
    await this.trackMetric({
      name: "StorageUsage",
      value: bytes,
      unit: StandardUnit.Bytes,
    });
  }

  async trackVideoViews(videoId: string, views: number) {
    await this.trackMetric({
      name: "VideoViews",
      value: views,
      unit: StandardUnit.Count,
      dimensions: {
        VideoId: videoId,
      },
    });
  }
}

export const creativeLoggingService = new CreativeLoggingService();
