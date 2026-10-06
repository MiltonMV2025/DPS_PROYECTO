import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) console.warn("EXPO_PUBLIC_API_URL is not configured");

export const api = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

let accessToken: string | null = null;
let refreshAccessToken: (() => Promise<string | null>) | null = null;
let clearSession: (() => Promise<void>) | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function configureAuth(input: {
  getAccessToken: () => string | null;
  refresh: () => Promise<string | null>;
  clear: () => Promise<void>;
}) {
  refreshAccessToken = input.refresh;
  clearSession = input.clear;
  accessToken = input.getAccessToken();
}

export function setAccessToken(value: string | null) {
  accessToken = value;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status !== 401 || !request || request._retry || !refreshAccessToken) throw error;
  request._retry = true;
  refreshInFlight ??= refreshAccessToken().finally(() => { refreshInFlight = null; });
  const nextToken = await refreshInFlight;
  if (!nextToken) {
    await clearSession?.();
    throw error;
  }
  accessToken = nextToken;
  request.headers.Authorization = `Bearer ${nextToken}`;
  return api(request);
});
