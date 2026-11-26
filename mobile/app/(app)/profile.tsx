import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/api/profile";
import { getApiErrorMessage } from "@/api/errors";
import { formatDateOnly } from "@/utils/format";
import { formatPhoneInput, validatePhone } from "@/utils/validation";
import { useAuth } from "@/auth/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { AppButton, AppCard, AppScreen, colors, DangerButton, ErrorState, LoadingState, SectionHeader, uiStyles } from "@/components/ui";

export default function ProfileScreen() {
  const client = useQueryClient();
  const toast = useToast();
  const { signOut } = useAuth();
  const query = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [phone, setPhone] = useState<string>();
  const [allergies, setAllergies] = useState<string>();
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const update = useMutation({
    mutationFn: () => updateProfile({ telefono: phone, alergias: allergies }),
    onSuccess: (profile) => { client.setQueryData(["profile"], profile); setPhone(undefined); setAllergies(undefined); toast({ variant: "success", title: "Datos actualizados", message: "Tu información se guardó correctamente." }); },
    onError: (error) => toast({ variant: "error", title: "No pudimos actualizar tu perfil", message: getApiErrorMessage(error, "Intentá nuevamente.") }),
  });
  if (query.isLoading) return <AppScreen><LoadingState label="Cargando tu perfil..." /></AppScreen>;
  if (query.isError || !query.data) return <AppScreen><SectionHeader title="Mi perfil" description="Administrá tus datos personales." /><ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tu perfil.")} onRetry={() => query.refetch()} /></AppScreen>;
  const profile = query.data;
  function save() {
    // Solo se valida el teléfono si el paciente lo modificó.
    const phoneError = phone === undefined ? undefined : validatePhone(phone);
    setPhoneInvalid(Boolean(phoneError));
    if (phoneError) return toast({ variant: "error", title: "Revisá los datos ingresados", message: phoneError });
    if (phone === undefined && allergies === undefined) return toast({ variant: "info", title: "Sin cambios", message: "Modificá tu teléfono o tus alergias antes de guardar." });
    update.mutate();
  }
  function requestSignOut() { Alert.alert("Cerrar sesión", "¿Querés cerrar sesión? Tendrás que volver a ingresar tus credenciales.", [{ text: "Cancelar", style: "cancel" }, { text: "Cerrar sesión", style: "destructive", onPress: () => { void signOut(); } }]); }
  return <AppScreen><SectionHeader title="Mi perfil" description="Mantené actualizada tu información de paciente." /><AppCard variant="highlight"><Text style={styles.cardTitle}>{profile.name}</Text><Text style={styles.detail}>{profile.email}</Text><Text style={styles.role}>Paciente</Text></AppCard><AppCard><Text style={styles.cardTitle}>Información personal</Text><Text style={uiStyles.label}>Fecha de nacimiento</Text><Text style={styles.detail}>{formatDateOnly(profile.birthDate)}</Text><Text style={uiStyles.label}>Teléfono</Text><TextInput style={[uiStyles.input, phoneInvalid && uiStyles.inputInvalid]} value={phone ?? profile.phone} onChangeText={(value) => { setPhone(formatPhoneInput(value)); setPhoneInvalid(false); }} keyboardType="phone-pad" placeholder="7455-6612" maxLength={9} /><Text style={uiStyles.label}>Alergias</Text><TextInput style={[uiStyles.input, uiStyles.multiline]} value={allergies ?? profile.allergies ?? ""} onChangeText={setAllergies} multiline placeholder="No registradas" /><AppButton title="Guardar cambios" loading={update.isPending} onPress={save} /></AppCard><AppCard><Text style={styles.cardTitle}>Cuenta</Text><Text style={styles.detail}>Tu sesión se mantiene protegida en este dispositivo.</Text><DangerButton title="Cerrar sesión" onPress={requestSignOut} /></AppCard></AppScreen>;
}

const styles = StyleSheet.create({ cardTitle: { color: colors.navy, fontSize: 18, fontWeight: "800" }, detail: { color: colors.muted, lineHeight: 20 }, role: { color: colors.primary, fontWeight: "700" } });
