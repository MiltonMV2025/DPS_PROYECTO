import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { cancelAppointment, listAppointments } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { formatDateTime } from "@/utils/format";
import { AppButton, AppCard, AppScreen, colors, DangerButton, EmptyState, ErrorState, LoadingState, SectionHeader, StatusBadge } from "@/components/ui";

export default function AppointmentsScreen() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const cancel = useMutation({ mutationFn: cancelAppointment, onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }) });
  if (query.isLoading) return <AppScreen><LoadingState label="Cargando tus citas..." /></AppScreen>;
  if (query.isError) return <AppScreen><SectionHeader title="Mis citas" description="Consultá tus citas y solicitudes." /><ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tus citas.")} onRetry={() => query.refetch()} /><AppButton title="Solicitar nueva cita" onPress={() => router.push("/(app)/book-appointment")} /></AppScreen>;
  return <AppScreen><SectionHeader title="Mis citas" description="Consultá tus citas y solicitudes." /><AppButton title="Solicitar nueva cita" onPress={() => router.push("/(app)/book-appointment")} />{cancel.isSuccess && <Text style={styles.success}>La cita se canceló correctamente.</Text>}{cancel.isError && <Text style={styles.error}>{getApiErrorMessage(cancel.error, "No pudimos cancelar la cita.")}</Text>}{query.data?.length ? query.data.map((item) => <AppCard key={item.id}><View style={styles.header}><View><Text style={styles.date}>{formatDateTime(item.dateTime)}</Text><Text style={styles.dentist}>{item.dentist}</Text></View><StatusBadge status={item.estado} /></View><Text style={styles.detail}>Duración: {item.durationMin} minutos</Text>{item.motivo && <Text style={styles.detail}>Motivo: {item.motivo}</Text>}{["pendiente", "confirmada"].includes(item.estado) && <DangerButton title={cancel.isPending && cancel.variables === item.id ? "Cancelando..." : "Cancelar cita"} loading={cancel.isPending && cancel.variables === item.id} disabled={cancel.isPending} onPress={() => Alert.alert("Cancelar cita", "¿Querés cancelar esta cita?", [{ text: "No" }, { text: "Sí, cancelar", style: "destructive", onPress: () => cancel.mutate(item.id) }])} />}</AppCard>) : <EmptyState title="Todavía no tenés citas" description="Solicitá tu primera cita para comenzar." action={<AppButton title="Solicitar cita" onPress={() => router.push("/(app)/book-appointment")} />} />}</AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, date: { color: colors.primary, fontWeight: "800", fontSize: 16 }, dentist: { color: colors.navy, fontWeight: "700", marginTop: 5 }, detail: { color: colors.muted }, success: { color: colors.success, backgroundColor: colors.successBackground, padding: 12, borderRadius: 10 }, error: { color: colors.danger, backgroundColor: colors.dangerBackground, padding: 12, borderRadius: 10 } });
