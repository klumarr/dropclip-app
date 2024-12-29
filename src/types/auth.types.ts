import { AuthUser, SignInOutput, SignUpOutput } from "@aws-amplify/auth";

export enum UserType {
  FAN = "FAN",
  CREATIVE = "CREATIVE",
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
  isInitialized: boolean;
  error: Error | null;
  signIn: (username: string, password: string) => Promise<SignInOutput>;
  signUp: (input: SignUpInput) => Promise<SignUpOutput>;
  signOut: () => Promise<void>;
  updateProfile: (attributes: Record<string, string>) => Promise<void>;
  clearError: () => void;
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

export interface AuthErrorType extends Error {
  code: string;
  originalError?: unknown;
}
