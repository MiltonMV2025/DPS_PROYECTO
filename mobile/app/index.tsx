import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#007BFF" /></View>;
  return <Redirect href={user ? "/(app)" : "/(auth)/login"} />;
}
