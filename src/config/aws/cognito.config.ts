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

export const cognitoConfig: CognitoConfig = {
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION,
  oauth: {
    domain: import.meta.env.VITE_COGNITO_DOMAIN,
    scope: ["openid", "email", "profile"],
    redirectSignIn: [
      import.meta.env.VITE_REDIRECT_SIGN_IN || window.location.origin,
    ],
    redirectSignOut: [
      import.meta.env.VITE_REDIRECT_SIGN_OUT || window.location.origin,
    ],
    responseType: "code",
  },
};
