// Core user types for authentication and permissions
export enum UserType {
  FAN = "FAN",
  CREATIVE = "CREATIVE",
}

// AWS Amplify User Attributes type
export interface UserAttributes {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Display categories for creative profiles
export enum CreativeCategory {
  MUSICIAN = "MUSICIAN",
  DJ = "DJ",
  BAND = "BAND",
  DANCER = "DANCER",
  COMEDIAN = "COMEDIAN",
  ARTIST = "ARTIST",
  OTHER = "OTHER",
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  sessionTimeout: number;
  passwordLastChanged: Date;
  backupCodes: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
  linkedAccounts?: {
    fan?: boolean;
    creative?: boolean;
  };
  isDormantCreative?: boolean;
  picture?: string;
  bio?: string;
  website?: string;
  location?: string;
  securitySettings: SecuritySettings;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Transformed user attributes for easier usage
export interface TransformedUserAttributes {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  userType?: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
  createdAt?: Date;
  updatedAt?: Date;
  twoFactorEnabled?: boolean;
  emailNotifications?: boolean;
  sessionTimeout?: number;
  passwordLastChanged?: Date;
  backupCodes?: string[];
}

// Utility function to transform AWS attributes
export const transformUserAttributes = (
  attrs: UserAttributes
): TransformedUserAttributes => {
  return {
    sub: attrs.sub,
    email: attrs.email,
    emailVerified: attrs.email_verified,
    name: attrs.name,
    picture: attrs.picture,
    userType: attrs["custom:userType"] as UserType,
    creativeCategory: attrs["custom:creativeCategory"] as CreativeCategory,
    customCategory: attrs["custom:customCategory"],
    createdAt: attrs["custom:createdAt"]
      ? new Date(attrs["custom:createdAt"])
      : undefined,
    updatedAt: attrs["custom:updatedAt"]
      ? new Date(attrs["custom:updatedAt"])
      : undefined,
    twoFactorEnabled: attrs["custom:twoFactorEnabled"] === "true",
    emailNotifications: attrs["custom:emailNotifications"] === "true",
    sessionTimeout: attrs["custom:sessionTimeout"]
      ? parseInt(attrs["custom:sessionTimeout"])
      : undefined,
    passwordLastChanged: attrs["custom:passwordLastChanged"]
      ? new Date(attrs["custom:passwordLastChanged"])
      : undefined,
    backupCodes: attrs["custom:backupCodes"]?.split(","),
  };
};
