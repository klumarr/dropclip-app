// Core user types for authentication and permissions
export enum UserType {
  FAN = "FAN",
  CREATIVE = "CREATIVE",
}

// Display categories for creative profiles
export enum CreativeCategory {
  ARTIST = "ARTIST",
  DJ = "DJ",
  BAND = "BAND",
  EVENT = "EVENT",
  FESTIVAL = "FESTIVAL",
  VENUE = "VENUE",
  INFLUENCER = "INFLUENCER",
  OTHER = "OTHER",
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  sessionTimeout: number;
  passwordLastChanged: Date;
  backupCodes?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
  securitySettings: SecuritySettings;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpInput {
  email: string;
  password: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}
