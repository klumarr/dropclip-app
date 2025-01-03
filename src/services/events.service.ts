import { fetchAuthSession } from "aws-amplify/auth";
import { get, post, put, del } from "aws-amplify/api";

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description: string;
  imageUrl?: string;
  ticketLink?: string;
  isAutomatic: boolean;
  user_id: string;
  status?: "upcoming" | "past";
  thumbnailUrl?: string;
  time?: string;
  attendees?: number;
  isInterested?: boolean;
  uploadConfig?: {
    enabled: boolean;
    allowedTypes: string[];
    maxFileSize: number;
  };
}

interface APIResponse<T> {
  events?: T[];
  event?: T;
  message?: string;
}

export const eventOperations = {
  async getCreativeEvents(): Promise<Event[]> {
    try {
      const session = await fetchAuthSession();
      if (!session?.tokens?.accessToken) {
        throw new Error("No access token available");
      }

      console.log(
        "Making API request with token:",
        session.tokens.accessToken.toString()
      );

      const response = await get({
        apiName: "dropclip-api",
        path: "/events/creative",
        options: {
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      }).response;

      if (!response.body) {
        throw new Error("No response body received");
      }

      const responseData = await response.body.json();
      console.log("API Response Data:", responseData);

      if (!responseData.events) {
        throw new Error("Invalid response format");
      }

      return responseData.events;
    } catch (error) {
      console.error("Error fetching creative events:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw new Error("Failed to fetch creative events");
    }
  },

  async createEvent(event: Omit<Event, "id">): Promise<Event> {
    try {
      const session = await fetchAuthSession();
      if (!session?.tokens?.accessToken) {
        throw new Error("No access token available");
      }

      const response = await post({
        apiName: "dropclip-api",
        path: "/events",
        options: {
          body: event,
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
          },
        },
      }).response;

      const responseData = (await response.body.json()) as APIResponse<Event>;
      if (!responseData?.event) {
        throw new Error("Invalid response format");
      }
      return responseData.event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  },

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    try {
      const session = await fetchAuthSession();
      if (!session?.tokens?.accessToken) {
        throw new Error("No access token available");
      }

      const response = await put({
        apiName: "dropclip-api",
        path: `/events/${id}`,
        options: {
          body: event,
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
          },
        },
      }).response;

      const responseData = (await response.body.json()) as APIResponse<Event>;
      if (!responseData?.event) {
        throw new Error("Invalid response format");
      }
      return responseData.event;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      const session = await fetchAuthSession();
      if (!session?.tokens?.accessToken) {
        throw new Error("No access token available");
      }

      await del({
        apiName: "dropclip-api",
        path: `/events/${id}`,
        options: {
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
          },
        },
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
    }
  },

  async getFanEvents(): Promise<Event[]> {
    try {
      const session = await fetchAuthSession();
      if (!session?.tokens?.accessToken) {
        throw new Error("No access token available");
      }

      console.log("Fetching fan events");

      const response = await get({
        apiName: "dropclip-api",
        path: "/events/fan",
        options: {
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
          },
        },
      }).response;

      const responseData = (await response.body.json()) as APIResponse<Event>;
      return responseData?.events || [];
    } catch (error) {
      console.error("Error fetching fan events:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw new Error("Failed to fetch fan events");
    }
  },
};
