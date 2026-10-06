import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { cancelAppointment, listAppointments } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { AppButton, AppCard, AppScreen, colors, DangerButton, EmptyState, ErrorState, LoadingState, SectionHeader, StatusBadge } from "@/components/ui";

export default function AppointmentsScreen() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const cancel = useMutation({ mutationFn: cancelAppointment, onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }) });
  if (query.isLoading) return <AppScreen><LoadingState label="Cargando tus citas..." /></AppScreen>;
  if (query.isError) return <AppScreen><SectionHeader title="Mis citas" description="Consultá tus citas y solicitudes." /><ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tus citas.")} onRetry={() => query.refetch()} /><AppButton title="Solicitar nueva cita" onPress={() => router.push("/(app)/book-appointment")} /></AppScreen>;
  return <AppScreen><SectionHeader title="Mis citas" description="Consultá tus citas y solicitudes." /><AppButton title="Solicitar nueva cita" onPress={() => router.push("/(app)/book-appointment")} />{query.data?.length ? query.data.map((item) => <AppCard key={item.id}><View style={styles.header}><View><Text style={styles.date}>{new Date(item.dateTime).toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" })}</Text><Text style={styles.dentist}>{item.dentist}</Text></View><StatusBadge status={item.estado} /></View><Text style={styles.detail}>Duración: {item.durationMin} minutos</Text>{item.motivo && <Text style={styles.detail}>Motivo: {item.motivo}</Text>}{["pendiente", "confirmada"].includes(item.estado) && <DangerButton title={cancel.isPending ? "Cancelando..." : "Cancelar cita"} loading={cancel.isPending} onPress={() => Alert.alert("Cancelar cita", "¿Querés cancelar esta cita?", [{ text: "No" }, { text: "Sí, cancelar", style: "destructive", onPress: () => cancel.mutate(item.id) }])} />}</AppCard>) : <EmptyState title="Todavía no tenés citas" description="Solicitá tu primera cita para comenzar." action={<AppButton title="Solicitar cita" onPress={() => router.push("/(app)/book-appointment")} />} />}</AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, date: { color: colors.primary, fontWeight: "800", fontSize: 16 }, dentist: { color: colors.navy, fontWeight: "700", marginTop: 5 }, detail: { color: colors.muted } });
