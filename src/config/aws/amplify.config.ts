import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    },
  },
};

console.log("Amplify Configuration:", {
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION,
});

Amplify.configure(awsConfig);

// Configure token signing for the Cognito User Pool
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  async getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  async setItem(key: string, value: string) {
    return Promise.resolve(localStorage.setItem(key, value));
  },
  async removeItem(key: string) {
    return Promise.resolve(localStorage.removeItem(key));
  },
  async clear() {
    return Promise.resolve(localStorage.clear());
  },
});

export default awsConfig;
