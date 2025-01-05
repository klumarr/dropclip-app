import { API_BASE_URL } from "../config";
import { fetchAuthSession } from "aws-amplify/auth";
import { Event, EventFormData } from "../types/events";

export type { Event, EventFormData };

export interface APIResponse {
  message?: string;
  events?: Event[];
  event?: Event;
  error?: string;
}

const getAuthHeaders = async () => {
  console.log("Getting auth session...");
  try {
    const session = await fetchAuthSession();
    console.log("Session:", {
      hasTokens: !!session.tokens,
      hasAccessToken: !!session.tokens?.accessToken,
      hasIdToken: !!session.tokens?.idToken,
    });

    if (!session.tokens?.accessToken) {
      console.error("No access token in session");
      throw new Error("No access token available");
    }

    const token = session.tokens.accessToken.toString();
    const decodedToken = JSON.parse(atob(token.split(".")[1]));

    console.log("🔍 Token details:", {
      scopes: decodedToken.scope?.split(" ") || [],
      exp: new Date(decodedToken.exp * 1000).toISOString(),
      tokenType: decodedToken.token_use,
      clientId: decodedToken.client_id,
      userId: decodedToken.sub,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log("Generated headers:", {
      hasContentType: "Content-Type" in headers,
      hasAuthorization: "Authorization" in headers,
      authPrefix: headers.Authorization?.substring(0, 10) + "...",
    });

    return headers;
  } catch (error) {
    console.error("Error getting auth headers:", error);
    throw new Error("Failed to get authentication headers");
  }
};

export const eventOperations = {
  getCreativeEvents: async (): Promise<Event[]> => {
    console.log("Fetching creative events...");
    try {
      const headers = await getAuthHeaders();
      const url = `${API_BASE_URL}/events/creative`;
      console.log("Making GET request to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "same-origin",
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid content type:", {
          contentType,
          responseText: text,
        });
        throw new Error("Invalid response format");
      }

      const data: APIResponse = await response.json();
      console.log("Received events data:", data);

      if (!data.events) {
        console.error("No events array in response:", data);
        return [];
      }

      return data.events;
    } catch (error) {
      console.error("Error fetching creative events:", error);
      throw error;
    }
  },

  createEvent: async (eventData: Omit<Event, "id">): Promise<Event> => {
    console.log("Creating new event:", eventData);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/events/creative`, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      console.log("Event creation response:", data);

      if (!data.event) {
        throw new Error("No event data in response");
      }

      return data.event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  updateEvent: async (
    eventId: string,
    eventData: Partial<Event>
  ): Promise<Event> => {
    console.log("🚀 Starting updateEvent:", {
      eventId,
      eventData,
      timestamp: new Date().toISOString(),
    });

    try {
      const headers = await getAuthHeaders();
      const session = await fetchAuthSession();
      const decodedToken = JSON.parse(
        atob(session.tokens?.accessToken?.toString().split(".")[1])
      );

      const { id, ...updateData } = eventData;

      const url = `${API_BASE_URL}/events/creative/${eventId}`;
      console.log("📡 Request details:", {
        url,
        method: "PUT",
        headers: {
          ...headers,
          Authorization: headers.Authorization?.substring(0, 20) + "...",
        },
        bodySize: JSON.stringify(updateData).length,
        contentType: headers["Content-Type"],
        updateData,
      });

      const response = await fetch(url, {
        method: "PUT",
        headers,
        credentials: "same-origin",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data: APIResponse = await response.json();
      if (!data.event) {
        throw new Error("No event data in response");
      }

      return data.event;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    console.log("Deleting event:", eventId);
    try {
      const headers = await getAuthHeaders();
      console.log("Making DELETE request with headers:", {
        method: "DELETE",
        headersPresent: Object.keys(headers),
        credentials: "same-origin",
      });

      const response = await fetch(
        `${API_BASE_URL}/events/creative/${eventId}`,
        {
          method: "DELETE",
          headers,
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
