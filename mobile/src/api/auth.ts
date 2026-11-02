import axios from "axios";
import { api, REQUEST_TIMEOUT_MS } from "./client";
import type { User } from "@/types/api";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export type TokenResponse = {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

type AuthErrorPayload = { error?: { code?: string } };

async function postAuth(
  operation: "password_login" | "google_login" | "google_register",
  path: string,
  payload: object,
) {
  try {
    const response = await axios.post<{ data: TokenResponse }>(
      `${baseURL}${path}`,
      payload,
      { timeout: REQUEST_TIMEOUT_MS },
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<AuthErrorPayload>(error)) {
      const apiCode = error.response?.data?.error?.code;
      const transportCode = error.code;
      console.warn(
        "[mobile-auth]",
        JSON.stringify({
          event: "auth_request_failed",
          operation,
          status: error.response?.status ?? null,
          code:
            apiCode && /^[A-Z0-9_]{1,64}$/.test(apiCode)
              ? apiCode
              : transportCode && /^[A-Z0-9_]{1,40}$/.test(transportCode)
                ? transportCode
                : "UNKNOWN",
        }),
      );
    } else {
      console.warn(
        "[mobile-auth]",
        JSON.stringify({
          event: "auth_request_failed",
          operation,
          code: "UNKNOWN",
        }),
      );
    }
    throw error;
  }
}

export async function login(correo: string, password: string) {
  return postAuth("password_login", "/api/v1/auth/mobile/login", {
    correo,
    password,
  });
}

export async function loginWithGoogle(idToken: string) {
  return postAuth("google_login", "/api/v1/auth/mobile/google", { idToken });
}

export async function registerWithGoogle(input: {
  idToken: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
}) {
  return postAuth(
    "google_register",
    "/api/v1/auth/mobile/google/register",
    input,
  );
}

export async function refresh(refreshToken: string) {
  const response = await axios.post<{ data: TokenResponse }>(
    `${baseURL}/api/v1/auth/mobile/refresh`,
    { refreshToken },
    { timeout: REQUEST_TIMEOUT_MS },
  );
  return response.data.data;
}

export async function logout() {
  await api.post("/api/v1/auth/mobile/logout");
}

export async function me() {
  const response = await api.get<{ data: User }>("/api/v1/auth/mobile/me");
  return response.data.data;
}
