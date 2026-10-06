import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, StyleSheet, View } from "react-native";
import { listAppointments } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { useAuth } from "@/auth/AuthProvider";
import { AppButton, AppCard, AppScreen, colors, EmptyState, ErrorState, LoadingState, SectionHeader, StatusBadge } from "@/components/ui";

export default function HomeScreen() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const appointments = query.data ?? [];
  const next = appointments.filter((item) => item.estado !== "cancelada" && new Date(item.dateTime).getTime() >= Date.now()).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
  const pending = appointments.filter((item) => item.estado === "pendiente").length;
  const confirmed = appointments.filter((item) => item.estado === "confirmada").length;
  return <AppScreen><Text style={styles.eyebrow}>Portal del paciente</Text><Text style={styles.title}>Hola, {user?.nombre}</Text><Text style={styles.subtitle}>Tu salud dental, más cerca y organizada.</Text><View style={styles.actions}><AppButton title="Solicitar cita" onPress={() => router.push("/(app)/book-appointment")} /><AppButton title="Ver mis citas" variant="secondary" onPress={() => router.push("/(app)/appointments")} /></View><View style={styles.metrics}><AppCard><Text style={styles.metricValue}>{pending}</Text><Text style={styles.metricLabel}>Solicitudes pendientes</Text></AppCard><AppCard><Text style={styles.metricValue}>{confirmed}</Text><Text style={styles.metricLabel}>Citas confirmadas</Text></AppCard></View><SectionHeader title="Próxima cita" description="Tu siguiente atención programada." />{query.isLoading ? <LoadingState label="Cargando tus citas..." /> : query.isError ? <ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tus citas.")} onRetry={() => query.refetch()} /> : next ? <AppCard variant="highlight"><Text style={styles.date}>{new Date(next.dateTime).toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" })}</Text><Text style={styles.dentist}>{next.dentist}</Text><StatusBadge status={next.estado} /><AppButton title="Ver todas mis citas" variant="secondary" onPress={() => router.push("/(app)/appointments")} /></AppCard> : <EmptyState title="Todavía no tenés citas" description="Solicitá tu primera cita para comenzar." action={<AppButton title="Solicitar cita" onPress={() => router.push("/(app)/book-appointment")} />} />}</AppScreen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.primary, fontWeight: "700" }, title: { color: colors.navy, fontSize: 29, fontWeight: "800" }, subtitle: { color: colors.muted, lineHeight: 21 }, actions: { gap: 10 }, metrics: { flexDirection: "row", gap: 12 }, metricValue: { color: colors.primary, fontSize: 28, fontWeight: "800" }, metricLabel: { color: colors.muted, lineHeight: 18 }, date: { color: colors.primary, fontSize: 18, fontWeight: "800" }, dentist: { color: colors.navy, fontSize: 16, fontWeight: "700" } });
