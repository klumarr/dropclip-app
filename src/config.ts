// Always use the full URL since we're making direct API calls
export const API_BASE_URL =
  "https://4t6y6pteaa.execute-api.eu-north-1.amazonaws.com/dev";

// Log the API configuration
console.log("🔧 API Configuration:", {
  baseUrl: API_BASE_URL,
  origin: window.location.origin,
});
