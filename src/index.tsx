import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Debug: Log all Vite environment variables
console.log('All Vite env vars:', import.meta.env);

// Import and initialize AWS configuration
import "./aws-config";

// Validate required environment variables
const requiredEnvVars = {
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
  VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
} else {
  console.log('Required env vars found:', requiredEnvVars);
}

// Make sure AWS config is loaded before rendering
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
