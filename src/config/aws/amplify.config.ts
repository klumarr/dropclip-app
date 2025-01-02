import { Amplify } from "aws-amplify";
import { cognitoConfig } from "./cognito.config";

const config = {
  Auth: {
    Cognito: cognitoConfig,
  },
};

Amplify.configure(config);

export default Amplify;
