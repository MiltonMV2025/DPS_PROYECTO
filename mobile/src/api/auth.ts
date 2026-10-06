import axios from "axios";
import { api } from "./client";
import type { User } from "@/types/api";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export type TokenResponse = { tokenType: "Bearer"; accessToken: string; refreshToken: string; expiresIn: number; user: User };

export async function login(correo: string, password: string) {
  const response = await axios.post<{ data: TokenResponse }>(`${baseURL}/api/v1/auth/mobile/login`, { correo, password });
  return response.data.data;
}

export async function refresh(refreshToken: string) {
  const response = await axios.post<{ data: TokenResponse }>(`${baseURL}/api/v1/auth/mobile/refresh`, { refreshToken });
  return response.data.data;
}

export async function logout() {
  await api.post("/api/v1/auth/mobile/logout");
}

export async function me() {
  const response = await api.get<{ data: User }>("/api/v1/auth/mobile/me");
  return response.data.data;
}
