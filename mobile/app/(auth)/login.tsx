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
import { useAuth, type GoogleAccount } from "@/auth/AuthProvider";
import { signOutGoogleFirebase } from "@/auth/google-auth";
import { getApiErrorMessage } from "@/api/errors";
import { DateField } from "@/components/DateField";
import { useToast } from "@/components/ToastProvider";
import { AppButton, AppCard, AppScreen, colors, uiStyles } from "@/components/ui";
import {
  formatPhoneInput,
  validateBirthDate,
  validateEmail,
  validateFullName,
  validatePhone,
} from "@/utils/validation";

type Field = "email" | "password" | "name" | "phone" | "birthDate";

const OLDEST_BIRTH_DATE = new Date(1900, 0, 1);
const DEFAULT_BIRTH_DATE = new Date(2000, 0, 1);

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

export default function LoginScreen() {
  const { user, signIn, signInWithGoogle, registerWithGoogle, sessionMessage } =
    useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState<Field[]>([]);
  const [googleAccount, setGoogleAccount] = useState<GoogleAccount | null>(null);
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
  useEffect(() => {
    if (sessionMessage)
      toast({ variant: "info", title: "Sesión finalizada", message: sessionMessage });
  }, [sessionMessage, toast]);
  if (user) return <Redirect href="/(app)" />;

  /** Marca los campos con error y muestra el primero en un toast. */
  function reportErrors(errors: [Field, string | undefined][]) {
    const failed = errors.filter((entry): entry is [Field, string] => Boolean(entry[1]));
    setInvalid(failed.map(([field]) => field));
    if (!failed.length) return false;
    toast({ variant: "error", title: "Revisá los datos ingresados", message: failed[0][1] });
    return true;
  }

  function clearInvalid(field: Field) {
    setInvalid((current) => current.filter((item) => item !== field));
  }

  async function submit() {
    if (
      reportErrors([
        ["email", validateEmail(email)],
        ["password", password ? undefined : "Ingresá tu contraseña."],
      ])
    )
      return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(app)");
    } catch (caught) {
      toast({
        variant: "error",
        title: "No pudimos iniciar sesión",
        message: getApiErrorMessage(caught, "Intentá nuevamente."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    setBusy(true);
    setInvalid([]);
    try {
      const result = await signInWithGoogle();
      if (result.status === "signed-in") router.replace("/(app)");
      if (result.status === "needs-registration") {
        pendingGoogle.current = true;
        registrationCompleted.current = false;
        setGoogleAccount(result.account);
        toast({
          variant: "info",
          title: "Completá tu registro",
          message:
            "No encontramos una cuenta con este correo. Ingresá tus datos para crear tu cuenta de paciente.",
        });
      }
    } catch (caught) {
      toast({
        variant: "error",
        title: "No pudimos continuar con Google",
        message: getApiErrorMessage(caught, "Intentá nuevamente."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogleRegistration() {
    if (!googleAccount) return;
    if (
      reportErrors([
        ["name", validateFullName(googleAccount.name)],
        ["phone", validatePhone(phone)],
        ["birthDate", validateBirthDate(birthDate)],
      ])
    )
      return;
    setBusy(true);
    try {
      await registerWithGoogle({
        idToken: googleAccount.idToken,
        nombre: googleAccount.name.trim(),
        telefono: formatPhoneInput(phone),
        fechaNacimiento: birthDate,
      });
      registrationCompleted.current = true;
      pendingGoogle.current = false;
      toast({ variant: "success", title: "Cuenta creada", message: "Ya podés solicitar tus citas desde la aplicación." });
      router.replace("/(app)");
    } catch (caught) {
      pendingGoogle.current = false;
      setGoogleAccount(null);
      toast({
        variant: "error",
        title: "No pudimos crear la cuenta",
        message: getApiErrorMessage(caught, "Intentá nuevamente."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function cancelGoogleRegistration() {
    pendingGoogle.current = false;
    setGoogleAccount(null);
    setInvalid([]);
    await signOutGoogleFirebase();
  }

  const isInvalid = (field: Field) => invalid.includes(field);

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
          {googleAccount ? (
            <>
              <Text style={uiStyles.label}>Correo de Google</Text>
              <Text style={styles.googleEmail}>{googleAccount.email}</Text>
              <View>
                <Text style={uiStyles.label}>Nombre completo</Text>
                <TextInput
                  value={googleAccount.name}
                  onChangeText={(name) => {
                    setGoogleAccount({ ...googleAccount, name });
                    clearInvalid("name");
                  }}
                  style={[uiStyles.input, isInvalid("name") && uiStyles.inputInvalid]}
                  editable={!busy}
                  autoComplete="name"
                />
              </View>
              <View>
                <Text style={uiStyles.label}>Teléfono</Text>
                <TextInput
                  value={phone}
                  onChangeText={(value) => {
                    setPhone(formatPhoneInput(value));
                    clearInvalid("phone");
                  }}
                  style={[uiStyles.input, isInvalid("phone") && uiStyles.inputInvalid]}
                  editable={!busy}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholder="7455-6612"
                  maxLength={9}
                />
              </View>
              <DateField
                label="Fecha de nacimiento"
                value={birthDate}
                onChange={(value) => {
                  setBirthDate(value);
                  clearInvalid("birthDate");
                }}
                minimumDate={OLDEST_BIRTH_DATE}
                maximumDate={yesterday()}
                initialDate={DEFAULT_BIRTH_DATE}
                disabled={busy}
                invalid={isInvalid("birthDate")}
              />
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
                    clearInvalid("email");
                  }}
                  style={[uiStyles.input, isInvalid("email") && uiStyles.inputInvalid]}
                  editable={!busy}
                />
              </View>
              <View>
                <Text style={uiStyles.label}>Contraseña</Text>
                <TextInput
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearInvalid("password");
                  }}
                  style={[uiStyles.input, isInvalid("password") && uiStyles.inputInvalid]}
                  editable={!busy}
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
                onPress={continueWithGoogle}
                loading={busy}
              />
              <Text style={styles.hint}>
                Si es tu primera vez, te pediremos algunos datos para crear tu cuenta.
              </Text>
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
  googleEmail: { color: colors.muted, paddingVertical: 8 },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center", lineHeight: 18 },
});
