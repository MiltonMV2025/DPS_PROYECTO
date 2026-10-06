import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { listAppointments } from "@/api/appointments";
import { useAuth } from "@/auth/AuthProvider";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const query = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const next = query.data?.[0];
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Hola, {user?.nombre}</Text>
    <Text style={styles.subtitle}>Tu información dental en un solo lugar.</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>Próxima cita</Text>{query.isLoading ? <ActivityIndicator color="#007BFF" /> : next ? <><Text>{next.dateTime}</Text><Text>{next.dentist}</Text><Text>{next.estado}</Text></> : <Text>No tenés citas próximas.</Text>}</View>
    {query.isError && <Text style={styles.error}>No se pudieron cargar tus citas.</Text>}
    <Button title="Cerrar sesión" onPress={signOut} color="#DC3545" />
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { gap: 16, padding: 24, backgroundColor: "#F4FAFF", flexGrow: 1 }, title: { fontSize: 26, fontWeight: "700", color: "#007BFF" }, subtitle: { color: "#555" }, card: { gap: 8, backgroundColor: "white", padding: 18, borderRadius: 14 }, cardTitle: { fontWeight: "700", fontSize: 18 }, error: { color: "#DC3545" } });
