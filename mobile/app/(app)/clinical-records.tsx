import { StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listClinicalRecords } from "@/api/clinical-records";
import { getApiErrorMessage } from "@/api/errors";
import { AppCard, AppScreen, colors, EmptyState, ErrorState, LoadingState, SectionHeader } from "@/components/ui";

export default function ClinicalRecordsScreen() {
  const query = useQuery({ queryKey: ["clinical-records"], queryFn: listClinicalRecords });
  if (query.isLoading) return <AppScreen><LoadingState label="Cargando tu historial..." /></AppScreen>;
  if (query.isError) return <AppScreen><SectionHeader title="Historial clínico" description="Consultá tus tratamientos y registros." /><ErrorState message={getApiErrorMessage(query.error, "No pudimos cargar tu historial clínico.")} onRetry={() => query.refetch()} /></AppScreen>;
  return <AppScreen><SectionHeader title="Historial clínico" description="Tus tratamientos y registros de atención." />{query.data?.length ? query.data.map((item) => <AppCard key={item.id}><Text style={styles.date}>{item.appointmentDate}</Text><Text style={styles.dentist}>Odontólogo: {item.dentist}</Text><Text><Text style={styles.label}>Diagnóstico: </Text>{item.diagnosis}</Text><Text><Text style={styles.label}>Tratamiento: </Text>{item.treatment}</Text>{item.observations && <Text><Text style={styles.label}>Observaciones: </Text>{item.observations}</Text>}{item.prescription && <Text><Text style={styles.label}>Receta: </Text>{item.prescription}</Text>}{item.recommendations && <Text><Text style={styles.label}>Recomendaciones: </Text>{item.recommendations}</Text>}</AppCard>) : <EmptyState title="Todavía no tenés historiales clínicos" description="Tus registros aparecerán después de completar una cita." />}</AppScreen>;
}

const styles = StyleSheet.create({ date: { color: colors.primary, fontWeight: "800", fontSize: 16 }, dentist: { color: colors.navy, fontWeight: "700" }, label: { fontWeight: "700", color: colors.navy } });
