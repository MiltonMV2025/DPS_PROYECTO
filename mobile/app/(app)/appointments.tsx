import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import { cancelAppointment, listAppointments } from "@/api/appointments";

export default function AppointmentsScreen() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const cancel = useMutation({ mutationFn: cancelAppointment, onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }) });
  return <FlatList contentContainerStyle={styles.container} data={query.data ?? []} keyExtractor={(item) => String(item.id)} refreshing={query.isFetching} onRefresh={() => query.refetch()} renderItem={({ item }) => <View style={styles.card}><Text style={styles.title}>{item.dateTime}</Text><Text>{item.dentist}</Text><Text>Estado: {item.estado}</Text>{["pendiente", "confirmada"].includes(item.estado) && <Button title="Cancelar" color="#DC3545" onPress={() => Alert.alert("Cancelar cita", "¿Querés cancelar esta cita?", [{ text: "No" }, { text: "Sí", onPress: () => cancel.mutate(item.id) }])} />}</View>} ListEmptyComponent={<Text>No tenés citas registradas.</Text>} />;
}

const styles = StyleSheet.create({ container: { gap: 14, padding: 20, backgroundColor: "#F4FAFF", flexGrow: 1 }, card: { gap: 8, padding: 16, backgroundColor: "white", borderRadius: 12 }, title: { fontWeight: "700", color: "#007BFF" } });
