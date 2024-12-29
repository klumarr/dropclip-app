import type { AuthUser } from "@aws-amplify/auth";
import type { AuthNextSignInStep, AuthNextSignUpStep } from "@aws-amplify/auth";

export enum UserType {
  VIEWER = "VIEWER",
  CREATOR = "CREATOR",
}

export interface UserAttributes {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  userType?: UserType;
}

export interface AuthContextType {
  user: AuthUser | null;
  userAttributes: UserAttributes | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signIn: (username: string, password: string) => Promise<AuthNextSignInStep>;
  signUp: (input: SignUpInput) => Promise<AuthNextSignUpStep>;
  signOut: () => Promise<void>;
  updateProfile: (attributes: Record<string, string>) => Promise<void>;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignUpInput {
  username: string;
  password: string;
  email: string;
  userType: UserType;
}
