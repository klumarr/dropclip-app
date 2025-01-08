// Always use the full URL since we're making direct API calls
export const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

// Log the API configuration
console.log("🔧 API Configuration:", {
  baseUrl: API_BASE_URL,
  origin: window.location.origin,
});
