import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Import AWS configuration
import "./config/aws/amplify.config";

// Debug: Log environment variables
console.log("Environment:", {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  region: import.meta.env.VITE_AWS_REGION,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
