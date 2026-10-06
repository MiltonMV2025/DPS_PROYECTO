import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useAuth } from "@/auth/AuthProvider";

export default function LoginScreen() {
  const { user, signIn } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Redirect href="/(app)" />;

  async function submit() {
    setBusy(true);
    try { await signIn(correo, password); router.replace("/(app)"); }
    catch (error) { Alert.alert("No se pudo iniciar sesión", error instanceof Error ? error.message : "Verificá tus credenciales."); }
    finally { setBusy(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>Sonrisa Digital</Text>
      <Text style={styles.subtitle}>Ingresá a tu cuenta</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} />
      <TextInput secureTextEntry placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} />
      <Button title={busy ? "Ingresando..." : "Iniciar sesión"} onPress={submit} disabled={busy || !correo || !password} color="#007BFF" />
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F4FAFF" }, card: { gap: 14, backgroundColor: "white", padding: 24, borderRadius: 16 }, title: { color: "#007BFF", fontSize: 28, fontWeight: "700" }, subtitle: { color: "#555", marginBottom: 8 }, input: { borderColor: "#D6E5F0", borderWidth: 1, borderRadius: 8, padding: 12 }, });
