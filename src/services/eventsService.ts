import { API_BASE_URL } from "../config";
import { fetchAuthSession } from "aws-amplify/auth";

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isAutomatic?: boolean;
  user_id: string;
}

export interface APIResponse {
  message?: string;
  events?: Event[];
  event?: Event;
  error?: string;
}

const getAuthHeaders = async () => {
  console.log("Getting auth session...");
  const session = await fetchAuthSession();
  const decodedToken = JSON.parse(
    atob(session.tokens?.accessToken?.toString().split(".")[1])
  );

  console.log("🔍 Token details:", {
    scopes: decodedToken.scope?.split(" ") || [],
    requiredScope: "aws.cognito.signin.user.admin",
    hasRequiredScope: (decodedToken.scope || "").includes(
      "aws.cognito.signin.user.admin"
    ),
    exp: new Date(decodedToken.exp * 1000).toISOString(),
    tokenType: decodedToken.token_use,
    clientId: decodedToken.client_id,
  });

  if (!session.tokens?.accessToken?.toString()) {
    throw new Error("No access token available");
  }

  const token = session.tokens.accessToken.toString();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  console.log("Generated headers:", {
    hasContentType: !!headers["Content-Type"],
    hasAuthorization: !!headers.Authorization,
    authPrefix: headers.Authorization.substring(0, 10) + "...",
  });

  return headers;
};

export const eventOperations = {
  getCreativeEvents: async (): Promise<Event[]> => {
    console.log("Fetching creative events...");
    try {
      const headers = await getAuthHeaders();
      console.log("Making GET request with headers:", {
        method: "GET",
        headersPresent: Object.keys(headers),
        credentials: "include",
      });

      const response = await fetch(`${API_BASE_URL}/events/creative`, {
        method: "GET",
        headers,
        credentials: "include",
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
      console.log("Received events data:", data);
      return data.events || [];
    } catch (error) {
      console.error("Error fetching creative events:", error);
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

      console.log("🔑 Auth details:", {
        tokenExpiry: new Date(decodedToken.exp * 1000).toISOString(),
        currentTime: new Date().toISOString(),
        isExpired: Date.now() > decodedToken.exp * 1000,
        tokenScopes: decodedToken.scope,
        tokenType: session.tokens?.accessToken?.toString().split(".")[0],
        headerKeys: Object.keys(headers),
      });

      const { id, user_id, ...updateData } = eventData;

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
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      console.log("📥 Response details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
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
      console.log("Event update response:", data);

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
        credentials: "include",
      });

      const response = await fetch(
        `${API_BASE_URL}/events/creative/${eventId}`,
        {
          method: "DELETE",
          headers,
          credentials: "include",
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
