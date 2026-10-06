import { useEffect } from "react";
import { Tabs, Redirect } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { registerDeviceToken } from "@/api/notifications";

export default function AppLayout() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user || process.env.EXPO_PUBLIC_ENABLE_PUSH !== "true") return;
    (async () => {
      try {
        const Notifications = await import("expo-notifications");
        const permission = await Notifications.requestPermissionsAsync();
        if (permission.status !== "granted") return;
        const token = await Notifications.getDevicePushTokenAsync();
        await registerDeviceToken(String(token.data));
      } catch {
        // Push setup is optional and requires a development build.
      }
    })();
  }, [user]);
  if (!user) return <Redirect href="/(auth)/login" />;
  const icon = (glyph: string, color: ColorValue, size: number) => <Text style={{ color, fontSize: size, lineHeight: size }}>{glyph}</Text>;
  return <Tabs screenOptions={{ tabBarActiveTintColor: "#33A7DC", tabBarInactiveTintColor: "#5B6B7A", tabBarLabelStyle: { fontSize: 11 }, tabBarStyle: { minHeight: 64, paddingTop: 6, paddingBottom: 6 } }}>
    <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ color, size }) => icon("\u2302", color, size) }} />
    <Tabs.Screen name="appointments" options={{ title: "Mis citas", tabBarIcon: ({ color, size }) => icon("\u25A3", color, size) }} />
    <Tabs.Screen name="book-appointment" options={{ title: "Agendar", tabBarIcon: ({ color, size }) => icon("+", color, size) }} />
    <Tabs.Screen name="clinical-records" options={{ title: "Historial", tabBarIcon: ({ color, size }) => icon("\u2637", color, size) }} />
    <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => icon("\u25C9", color, size) }} />
  </Tabs>;
}
