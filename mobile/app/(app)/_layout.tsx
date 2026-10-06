import { useEffect } from "react";
import { Tabs, Redirect } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/auth/AuthProvider";
import { registerDeviceToken } from "@/api/notifications";

export default function AppLayout() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const permission = await Notifications.requestPermissionsAsync();
        if (permission.status !== "granted") return;
        const token = await Notifications.getDevicePushTokenAsync();
        await registerDeviceToken(String(token.data));
      } catch {
        // Push setup needs native credentials and may be unavailable during local development.
      }
    })();
  }, [user]);
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Tabs screenOptions={{ tabBarActiveTintColor: "#007BFF", headerTintColor: "#007BFF" }}>
    <Tabs.Screen name="index" options={{ title: "Inicio" }} />
    <Tabs.Screen name="appointments" options={{ title: "Mis citas" }} />
    <Tabs.Screen name="book-appointment" options={{ title: "Agendar" }} />
    <Tabs.Screen name="clinical-records" options={{ title: "Historial" }} />
    <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
  </Tabs>;
}
