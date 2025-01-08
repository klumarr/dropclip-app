import { Amplify } from "aws-amplify";

const config = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "eu-north-1_OOIFH855z",
      userPoolClientId:
        import.meta.env.VITE_USER_POOL_CLIENT_ID ||
        "6ql7knc7d1vl13tvkf2t2qh7gv",
    },
  },
  API: {
    REST: {
      "dropclip-api": {
        endpoint:
          import.meta.env.VITE_API_ENDPOINT ||
          "https://4t6y6pteaa.execute-api.eu-north-1.amazonaws.com/dev",
        region: import.meta.env.VITE_AWS_REGION || "eu-north-1",
      },
    },
  },
};

export const initializeAWS = () => {
  Amplify.configure(config);
};

export default config;
