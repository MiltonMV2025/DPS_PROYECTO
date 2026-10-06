import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useAuth } from "@/auth/AuthProvider";
import { getApiErrorMessage } from "@/api/errors";
import { AppButton, AppCard, AppScreen, colors, FieldError, uiStyles } from "@/components/ui";

export default function LoginScreen() {
  const { user, signIn, sessionMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  if (user) return <Redirect href="/(app)" />;

  async function submit() {
    const normalized = email.trim();
    const nextEmailError = !normalized ? "Ingresá tu correo electrónico." : !/^\S+@\S+\.\S+$/.test(normalized) ? "Ingresá un correo electrónico válido." : undefined;
    setEmailError(nextEmailError);
    if (nextEmailError || !password) { if (!password) setError("Ingresá tu contraseña."); return; }
    setBusy(true); setError(null);
    try { await signIn(normalized, password); router.replace("/(app)"); }
    catch (caught) { setError(getApiErrorMessage(caught, "No pudimos iniciar sesión.")); }
    finally { setBusy(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}><AppScreen contentStyle={styles.container}><View style={styles.brand}><Text style={styles.logo}>Sonrisa Digital</Text><Text style={styles.subtitle}>Tu salud dental, más cerca.</Text></View><AppCard><Text style={styles.title}>Ingresá a tu cuenta</Text>{(error || sessionMessage) && <Text accessibilityRole="alert" style={styles.formError}>{error ?? sessionMessage}</Text>}<View><Text style={uiStyles.label}>Correo electrónico</Text><TextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={(value) => { setEmail(value); setEmailError(undefined); setError(null); }} style={[uiStyles.input, emailError && uiStyles.inputInvalid]} editable={!busy} /><FieldError message={emailError} /></View><View><Text style={uiStyles.label}>Contraseña</Text><TextInput secureTextEntry autoComplete="password" value={password} onChangeText={(value) => { setPassword(value); setError(null); }} style={uiStyles.input} editable={!busy} /><FieldError message={!password && error === "Ingresá tu contraseña." ? error : undefined} /></View><AppButton title="Iniciar sesión" onPress={submit} loading={busy} /></AppCard></AppScreen></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ keyboard: { flex: 1 }, container: { justifyContent: "center" }, brand: { alignItems: "center", marginBottom: 8 }, logo: { color: colors.primary, fontSize: 30, fontWeight: "800" }, subtitle: { color: colors.muted, marginTop: 6 }, title: { color: colors.navy, fontSize: 22, fontWeight: "700", marginBottom: 4 }, formError: { color: colors.danger, backgroundColor: colors.dangerBackground, borderRadius: 10, padding: 12, lineHeight: 19 } });
