import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createAppointment, getAvailability } from "@/api/appointments";

export default function BookAppointmentScreen() {
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<{ dentist: number; start: string } | null>(null);
  const availability = useQuery({ queryKey: ["availability", date, duration], queryFn: () => getAvailability({ date, duracionMin: duration }), enabled: /^\d{4}-\d{2}-\d{2}$/.test(date) });
  const create = useMutation({ mutationFn: () => createAppointment({ idOdontologo: selected!.dentist, fechaHora: selected!.start, duracionMin: duration }), onSuccess: () => Alert.alert("Cita creada", "Tu cita quedó registrada.") });
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Agendar cita</Text><TextInput placeholder="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} style={styles.input} /><Text>Duración en minutos</Text><View style={styles.row}><Button title="30" onPress={() => setDuration(30)} color={duration === 30 ? "#007BFF" : "#999"} /><Button title="45" onPress={() => setDuration(45)} color={duration === 45 ? "#007BFF" : "#999"} /><Button title="60" onPress={() => setDuration(60)} color={duration === 60 ? "#007BFF" : "#999"} /></View>{availability.data?.dentists.map((dentist) => <View key={dentist.id} style={styles.card}><Text style={styles.subtitle}>{dentist.name}</Text>{dentist.slots.map((slot) => <Button key={slot.start} title={`${slot.start.slice(11, 16)} - ${slot.end.slice(11, 16)}`} onPress={() => setSelected({ dentist: dentist.id, start: slot.start })} color={selected?.start === slot.start ? "#28A745" : "#007BFF"} />)}</View>)}{availability.isError && <Text style={styles.error}>No se pudo consultar disponibilidad.</Text>}{selected && <Button title={create.isPending ? "Guardando..." : "Confirmar cita"} onPress={() => create.mutate()} disabled={create.isPending} color="#28A745" />}</ScrollView>;
}

const styles = StyleSheet.create({ container: { gap: 14, padding: 20, backgroundColor: "#F4FAFF", flexGrow: 1 }, title: { fontSize: 24, fontWeight: "700", color: "#007BFF" }, subtitle: { fontWeight: "700" }, input: { backgroundColor: "white", borderWidth: 1, borderColor: "#D6E5F0", borderRadius: 8, padding: 12 }, row: { flexDirection: "row", justifyContent: "space-around" }, card: { gap: 8, backgroundColor: "white", padding: 14, borderRadius: 12 }, error: { color: "#DC3545" } });
