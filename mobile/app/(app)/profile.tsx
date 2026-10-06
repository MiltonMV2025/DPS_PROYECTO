import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { getProfile, updateProfile } from "@/api/profile";

export default function ProfileScreen() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [phone, setPhone] = useState<string | undefined>();
  const [allergies, setAllergies] = useState<string | null | undefined>();
  const update = useMutation({ mutationFn: () => updateProfile({ telefono: phone, alergias: allergies }), onSuccess: (profile) => { client.setQueryData(["profile"], profile); Alert.alert("Perfil actualizado"); } });
  if (query.isLoading || !query.data) return <ActivityIndicator style={{ flex: 1 }} color="#007BFF" />;
  const profile = query.data;
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Mi perfil</Text><Text>Nombre: {profile.name}</Text><Text>Correo: {profile.email}</Text><Text>Fecha de nacimiento: {profile.birthDate}</Text><Text>Teléfono</Text><TextInput style={styles.input} value={phone ?? profile.phone} onChangeText={setPhone} /><Text>Alergias</Text><TextInput style={styles.input} value={allergies ?? profile.allergies ?? ""} onChangeText={setAllergies} multiline /><Button title={update.isPending ? "Guardando..." : "Guardar cambios"} onPress={() => update.mutate()} disabled={update.isPending} color="#007BFF" /></ScrollView>;
}

const styles = StyleSheet.create({ container: { gap: 14, padding: 24, backgroundColor: "#F4FAFF", flexGrow: 1 }, title: { fontSize: 24, color: "#007BFF", fontWeight: "700" }, input: { backgroundColor: "white", borderWidth: 1, borderColor: "#D6E5F0", borderRadius: 8, padding: 12 } });
