import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/api/profile";
import { getApiErrorMessage } from "@/api/errors";
import { useAuth } from "@/auth/AuthProvider";
import { AppButton, AppCard, AppScreen, colors, DangerButton, ErrorState, LoadingState, SectionHeader, uiStyles } from "@/components/ui";

export default function ProfileScreen() {
  const client = useQueryClient();
  const { signOut } = useAuth();
  const query = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [phone, setPhone] = useState<string>();
  const [allergies, setAllergies] = useState<string>();
  const [saved, setSaved] = useState(false);
  const update = useMutation({ mutationFn: () => updateProfile({ telefono: phone, alergias: allergies }), onSuccess: (profile) => { client.setQueryData(["profile"], profile); setPhone(undefined); setAllergies(undefined); setSaved(true); } });
  if (query.isLoading) return <AppScreen><LoadingState label="Cargando tu perfil..." /></AppScreen>;
  if (query.isError || !query.data) return <AppScreen><SectionHeader title="Mi perfil" description="Administrá tus datos personales." /><ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tu perfil.")} onRetry={() => query.refetch()} /></AppScreen>;
  const profile = query.data;
  function requestSignOut() { Alert.alert("Cerrar sesión", "¿Querés cerrar sesión? Tendrás que volver a ingresar tus credenciales.", [{ text: "Cancelar", style: "cancel" }, { text: "Cerrar sesión", style: "destructive", onPress: () => { void signOut(); } }]); }
  return <AppScreen><SectionHeader title="Mi perfil" description="Mantené actualizada tu información de paciente." />{saved && <Text style={styles.success}>Tus datos se actualizaron correctamente.</Text>}<AppCard variant="highlight"><Text style={styles.cardTitle}>{profile.name}</Text><Text style={styles.detail}>{profile.email}</Text><Text style={styles.role}>Paciente</Text></AppCard><AppCard><Text style={styles.cardTitle}>Información personal</Text><Text style={uiStyles.label}>Fecha de nacimiento</Text><Text style={styles.detail}>{profile.birthDate}</Text><Text style={uiStyles.label}>Teléfono</Text><TextInput style={uiStyles.input} value={phone ?? profile.phone} onChangeText={(value) => { setPhone(value); setSaved(false); }} keyboardType="phone-pad" /><Text style={uiStyles.label}>Alergias</Text><TextInput style={[uiStyles.input, uiStyles.multiline]} value={allergies ?? profile.allergies ?? ""} onChangeText={(value) => { setAllergies(value); setSaved(false); }} multiline placeholder="No registradas" /><AppButton title="Guardar cambios" loading={update.isPending} onPress={() => update.mutate()} />{update.isError && <Text style={styles.error}>{getApiErrorMessage(update.error, "No pudimos actualizar tu perfil.")}</Text>}</AppCard><AppCard><Text style={styles.cardTitle}>Cuenta</Text><Text style={styles.detail}>Tu sesión se mantiene protegida en este dispositivo.</Text><DangerButton title="Cerrar sesión" onPress={requestSignOut} /></AppCard></AppScreen>;
}

const styles = StyleSheet.create({ cardTitle: { color: colors.navy, fontSize: 18, fontWeight: "800" }, detail: { color: colors.muted, lineHeight: 20 }, role: { color: colors.primary, fontWeight: "700" }, success: { color: colors.success, backgroundColor: colors.successBackground, padding: 12, borderRadius: 10 }, error: { color: colors.danger, marginTop: 8 } });
