import { Amplify } from "aws-amplify";

interface CognitoConfig {
  userPoolId: string;
  userPoolClientId: string;
  region: string;
  oauth: {
    domain: string;
    scope: string[];
    redirectSignIn: string[];
    redirectSignOut: string[];
    responseType: string;
  };
}

const cognitoConfig: CognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION,
  oauth: {
    domain: import.meta.env.VITE_COGNITO_DOMAIN,
    scope: ["openid", "email", "profile"],
    redirectSignIn: [window.location.origin],
    redirectSignOut: [window.location.origin],
    responseType: "code",
  },
};

const config = {
  Auth: {
    Cognito: cognitoConfig,
  },
};

Amplify.configure(config);

export default Amplify;
