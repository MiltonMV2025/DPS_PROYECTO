import { Platform } from "react-native";
import { api } from "./client";

export async function registerDeviceToken(token: string) {
  await api.post("/api/v1/notifications/devices", { token, platform: Platform.OS });
}

export async function unregisterDeviceToken(token: string) {
  await api.delete("/api/v1/notifications/devices", { data: { token } });
}
