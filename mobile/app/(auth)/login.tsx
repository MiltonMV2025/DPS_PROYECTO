import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useAuth } from "@/auth/AuthProvider";
import {
  signInWithGoogleFirebase,
  signOutGoogleFirebase,
} from "@/auth/google-auth";
import {
  logGoogleAuthFailure,
  logGoogleAuthStage,
} from "@/auth/google-auth-diagnostics";
import { getApiErrorMessage } from "@/api/errors";
import {
  AppButton,
  AppCard,
  AppScreen,
  colors,
  FieldError,
  uiStyles,
} from "@/components/ui";

export default function LoginScreen() {
  const { user, signIn, signInWithGoogle, registerWithGoogle, sessionMessage } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [googleAccount, setGoogleAccount] = useState<{
    idToken: string;
    email: string;
    name: string;
  } | null>(null);
  const pendingGoogle = useRef(false);
  const registrationCompleted = useRef(false);
  useEffect(
    () => () => {
      if (pendingGoogle.current && !registrationCompleted.current) {
        void signOutGoogleFirebase();
      }
    },
    [],
  );
  if (user) return <Redirect href="/(app)" />;

  async function submit() {
    const normalized = email.trim();
    const nextEmailError = !normalized
      ? "Ingresá tu correo electrónico."
      : !/^\S+@\S+\.\S+$/.test(normalized)
        ? "Ingresá un correo electrónico válido."
        : undefined;
    setEmailError(nextEmailError);
    if (nextEmailError || !password) {
      if (!password) setError("Ingresá tu contraseña.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(normalized, password);
      router.replace("/(app)");
    } catch (caught) {
      setError(getApiErrorMessage(caught, "No pudimos iniciar sesión."));
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogle() {
    setBusy(true);
    setError(null);
    try {
      if (await signInWithGoogle()) router.replace("/(app)");
    } catch (caught) {
      setError(
        getApiErrorMessage(caught, "No pudimos iniciar sesión con Google."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function startGoogleRegistration() {
    setBusy(true);
    setError(null);
    try {
      const account = await signInWithGoogleFirebase();
      if (!account) return;
      let idToken: string;
      try {
        idToken = await account.getIdToken();
        logGoogleAuthStage("firebase_id_token");
      } catch (tokenError) {
        logGoogleAuthFailure("firebase_id_token", tokenError);
        throw tokenError;
      }
      pendingGoogle.current = true;
      registrationCompleted.current = false;
      setGoogleAccount({
        idToken,
        email: account.email ?? "",
        name: account.displayName ?? "",
      });
    } catch (caught) {
      await signOutGoogleFirebase();
      setError(
        getApiErrorMessage(
          caught,
          "No pudimos iniciar el registro con Google.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogleRegistration() {
    if (!googleAccount) return;
    setBusy(true);
    setError(null);
    try {
      await registerWithGoogle({
        idToken: googleAccount.idToken,
        nombre: googleAccount.name.trim(),
        telefono: phone.trim(),
        fechaNacimiento: birthDate.trim(),
      });
      registrationCompleted.current = true;
      pendingGoogle.current = false;
      router.replace("/(app)");
    } catch (caught) {
      pendingGoogle.current = false;
      setGoogleAccount(null);
      setError(getApiErrorMessage(caught, "No pudimos crear la cuenta."));
    } finally {
      setBusy(false);
    }
  }

  async function cancelGoogleRegistration() {
    pendingGoogle.current = false;
    setGoogleAccount(null);
    await signOutGoogleFirebase();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboard}
    >
      <AppScreen contentStyle={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.logo}>Sonrisa Digital</Text>
          <Text style={styles.subtitle}>Tu salud dental, más cerca.</Text>
        </View>
        <AppCard>
          <Text style={styles.title}>
            {googleAccount ? "Completar registro" : "Ingresá a tu cuenta"}
          </Text>
          {(error || sessionMessage) && (
            <Text accessibilityRole="alert" style={styles.formError}>
              {error ?? sessionMessage}
            </Text>
          )}
          {googleAccount ? (
            <>
              <Text style={uiStyles.label}>Correo de Google</Text>
              <Text style={styles.googleEmail}>{googleAccount.email}</Text>
              <View>
                <Text style={uiStyles.label}>Nombre completo</Text>
                <TextInput
                  value={googleAccount.name}
                  onChangeText={(name) =>
                    setGoogleAccount({ ...googleAccount, name })
                  }
                  style={uiStyles.input}
                  editable={!busy}
                  autoComplete="name"
                />
              </View>
              <View>
                <Text style={uiStyles.label}>Teléfono</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={uiStyles.input}
                  editable={!busy}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
              <View>
                <Text style={uiStyles.label}>
                  Fecha de nacimiento (AAAA-MM-DD)
                </Text>
                <TextInput
                  value={birthDate}
                  onChangeText={setBirthDate}
                  style={uiStyles.input}
                  editable={!busy}
                  placeholder="2000-01-31"
                />
              </View>
              <AppButton
                title="Crear cuenta"
                onPress={submitGoogleRegistration}
                loading={busy}
              />
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={cancelGoogleRegistration}
                disabled={busy}
              />
            </>
          ) : (
            <>
              <View>
                <Text style={uiStyles.label}>Correo electrónico</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setEmailError(undefined);
                    setError(null);
                  }}
                  style={[uiStyles.input, emailError && uiStyles.inputInvalid]}
                  editable={!busy}
                />
                <FieldError message={emailError} />
              </View>
              <View>
                <Text style={uiStyles.label}>Contraseña</Text>
                <TextInput
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError(null);
                  }}
                  style={uiStyles.input}
                  editable={!busy}
                />
                <FieldError
                  message={
                    !password && error === "Ingresá tu contraseña."
                      ? error
                      : undefined
                  }
                />
              </View>
              <AppButton
                title="Iniciar sesión"
                onPress={submit}
                loading={busy}
              />
              <AppButton
                title="Continuar con Google"
                variant="secondary"
                onPress={submitGoogle}
                loading={busy}
              />
              <AppButton
                title="Crear cuenta con Google"
                variant="secondary"
                onPress={startGoogleRegistration}
                loading={busy}
              />
            </>
          )}
        </AppCard>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: { justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 8 },
  logo: { color: colors.primary, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.muted, marginTop: 6 },
  title: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  formError: {
    color: colors.danger,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 12,
    lineHeight: 19,
  },
  googleEmail: { color: colors.muted, paddingVertical: 8 },
});
