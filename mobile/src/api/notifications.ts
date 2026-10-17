import { Platform } from "react-native";
import { api } from "./client";

let registeredToken: string | null = null;

export async function registerDeviceToken(token: string) {
  await api.post("/api/v1/notifications/devices", { token, platform: Platform.OS });
  registeredToken = token;
}

export async function unregisterDeviceToken(token: string) {
  await api.delete("/api/v1/notifications/devices", { data: { token } });
}

export async function unregisterCurrentDeviceToken() {
  if (!registeredToken) return;
  const token = registeredToken;
  registeredToken = null;
  try { await unregisterDeviceToken(token); } catch { /* el cierre de sesion no debe fallar por esto */ }
}
