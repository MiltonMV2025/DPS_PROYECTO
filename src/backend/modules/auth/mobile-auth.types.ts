import type { SessionUser } from "./auth.types";

export const MOBILE_ACCESS_TOKEN_AUDIENCE = "mobile";
export const MOBILE_ACCESS_TOKEN_TYPE = "mobile-access";
export const MOBILE_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
export const MOBILE_REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export type MobileAuthContext = {
  user: SessionUser;
  familyToken: string;
};

export type MobileTokenResponse = {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
};
