import { api } from "./client";
import type { Profile } from "@/types/api";

export async function getProfile() {
  const response = await api.get<{ data: Profile }>("/api/v1/me/profile");
  return response.data.data;
}

export async function updateProfile(input: { telefono?: string; alergias?: string | null }) {
  const response = await api.patch<{ data: Profile }>("/api/v1/me/profile", input);
  return response.data.data;
}
