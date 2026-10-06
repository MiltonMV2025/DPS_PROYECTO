import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { listClinicalRecords } from "@/api/clinical-records";

export default function ClinicalRecordsScreen() {
  const query = useQuery({ queryKey: ["clinical-records"], queryFn: listClinicalRecords });
  if (query.isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#007BFF" />;
  return <FlatList contentContainerStyle={styles.container} data={query.data ?? []} keyExtractor={(item) => String(item.id)} ListEmptyComponent={<Text>No hay historiales clínicos disponibles.</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.title}>{item.appointmentDate}</Text><Text>Odontólogo: {item.dentist}</Text><Text>Diagnóstico: {item.diagnosis}</Text><Text>Tratamiento: {item.treatment}</Text>{item.observations && <Text>Observaciones: {item.observations}</Text>}</View>} />;
}

const styles = StyleSheet.create({ container: { gap: 14, padding: 20, backgroundColor: "#F4FAFF", flexGrow: 1 }, card: { gap: 6, backgroundColor: "white", padding: 16, borderRadius: 12 }, title: { color: "#007BFF", fontWeight: "700" } });
