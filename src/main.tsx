import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Amplify } from "aws-amplify";

// Initialize AWS configuration
const config = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "eu-north-1_OOIFH855z",
      userPoolClientId:
        import.meta.env.VITE_USER_POOL_CLIENT_ID ||
        "6ql7knc7d1vl13tvkf2t2qh7gv",
      identityPoolId: "eu-north-1:c7555a80-f109-4329-939f-4ee8678383b8",
      region: "eu-north-1",
      oauth: {
        domain: import.meta.env.VITE_COGNITO_DOMAIN || "",
        scope: ["openid", "email", "profile"],
        redirectSignIn: [
          import.meta.env.VITE_REDIRECT_SIGN_IN || window.location.origin,
        ],
        redirectSignOut: [
          import.meta.env.VITE_REDIRECT_SIGN_OUT || window.location.origin,
        ],
        responseType: "code",
      },
    },
  },
  API: {
    REST: {
      "dropclip-api": {
        endpoint:
          import.meta.env.VITE_API_ENDPOINT ||
          "https://4t6y6pteaa.execute-api.eu-north-1.amazonaws.com/dev",
        region: "eu-north-1",
      },
    },
  },
};

Amplify.configure(config);

// Debug: Log environment variables
console.log("Environment:", {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  region: "eu-north-1",
  identityPoolId: "eu-north-1:c7555a80-f109-4329-939f-4ee8678383b8",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
