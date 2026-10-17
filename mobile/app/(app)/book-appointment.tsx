import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { createAppointment, getAvailability } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { Calendar } from "@/components/Calendar";
import { AppButton, AppCard, AppScreen, colors, EmptyState, ErrorState, LoadingState, SectionHeader, uiStyles } from "@/components/ui";
import { formatDate, formatSlotDateTime, formatSlotTime, parseDateKey } from "@/utils/format";

type Selection = { dentist: number; dentistName: string; start: string; end: string };

export default function BookAppointmentScreen() {
  const client = useQueryClient();
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const availability = useQuery({
    queryKey: ["availability", date, duration],
    queryFn: () => getAvailability({ date, duracionMin: duration }),
    enabled: date !== "",
  });
  const create = useMutation({
    mutationFn: () => createAppointment({ idOdontologo: selected!.dentist, fechaHora: selected!.start, duracionMin: duration, motivo: reason }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["appointments"] });
      setSuccess(true);
      setSelected(null);
    },
  });

  function resetForm() {
    setDate("");
    setDuration(30);
    setSelected(null);
    setReason("");
    setSuccess(false);
    setFormKey((value) => value + 1);
    create.reset();
  }

  // Las pestañas no se desmontan: al salir de esta pantalla se limpia el formulario
  // para que siempre se abra vacío, entre desde donde entre.
  const resetRef = useRef(resetForm);
  resetRef.current = resetForm;
  useFocusEffect(useCallback(() => () => resetRef.current(), []));

  if (success) {
    return (
      <AppScreen>
        <AppCard variant="highlight">
          <Text style={styles.successTitle}>Solicitud enviada correctamente</Text>
          <Text style={styles.successText}>La clínica revisará tu solicitud y te notificará cuando sea confirmada.</Text>
          <AppButton title="Ver mis citas" onPress={() => router.replace("/(app)/appointments")} />
          <AppButton title="Solicitar otra cita" variant="secondary" onPress={resetForm} />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionHeader title="Solicitar cita" description="Elegí una fecha, un horario y contanos el motivo de tu consulta." />
      <AppCard>
        <Text style={uiStyles.label}>1. Fecha</Text>
        <Calendar key={formKey} value={date} onChange={(key) => { setDate(key); setSelected(null); }} />
        <Text style={styles.confirmation}>{date ? `Fecha elegida: ${formatDate(parseDateKey(date))}` : "Tocá un día del calendario para ver los horarios."}</Text>
      </AppCard>
      <AppCard>
        <Text style={uiStyles.label}>2. Duración</Text>
        <View style={styles.options}>
          {[30, 45, 60].map((value) => (
            <AppButton key={value} title={`${value} min`} variant={duration === value ? "primary" : "secondary"} onPress={() => { setDuration(value); setSelected(null); }} />
          ))}
        </View>
      </AppCard>
      {availability.isLoading && <LoadingState label="Buscando horarios disponibles..." />}
      {availability.isError && <ErrorState message={getApiErrorMessage(availability.error, "No pudimos consultar la disponibilidad.")} onRetry={() => availability.refetch()} />}
      {availability.data && (
        <AppCard>
          <Text style={uiStyles.label}>3. Horario disponible</Text>
          {availability.data.dentists.length ? availability.data.dentists.map((dentist) => (
            <View key={dentist.id} style={styles.dentist}>
              <Text style={styles.dentistName}>{dentist.name}</Text>
              <View style={styles.slots}>
                {dentist.slots.map((slot) => (
                  <AppButton
                    key={slot.start}
                    title={`${formatSlotTime(slot.start)} - ${formatSlotTime(slot.end)}`}
                    variant={selected?.dentist === dentist.id && selected.start === slot.start ? "primary" : "secondary"}
                    onPress={() => setSelected({ dentist: dentist.id, dentistName: dentist.name, start: slot.start, end: slot.end })}
                  />
                ))}
              </View>
            </View>
          )) : <EmptyState title="No hay horarios disponibles" description="Probá con otra fecha o duración." />}
        </AppCard>
      )}
      {selected && (
        <AppCard>
          <Text style={uiStyles.label}>4. Motivo de la consulta</Text>
          <TextInput placeholder="Consulta, limpieza, control..." maxLength={150} value={reason} onChangeText={setReason} multiline style={[uiStyles.input, uiStyles.multiline]} />
          <Text style={styles.counter}>{reason.length}/150</Text>
          <Text style={styles.confirmation}>Odontólogo: {selected.dentistName}</Text>
          <Text style={styles.confirmation}>Fecha: {formatSlotDateTime(selected.start)}</Text>
          <Text style={styles.confirmation}>Horario: {formatSlotTime(selected.start)} - {formatSlotTime(selected.end)} ({duration} min)</Text>
          <AppButton title="Enviar solicitud" loading={create.isPending} onPress={() => create.mutate()} />
          {create.isError && <Text style={styles.error}>{getApiErrorMessage(create.error, "No pudimos enviar la solicitud.")}</Text>}
        </AppCard>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  options: { gap: 10 },
  dentist: { gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 },
  dentistName: { color: colors.navy, fontWeight: "700" },
  slots: { gap: 8 },
  counter: { color: colors.muted, textAlign: "right", fontSize: 12 },
  confirmation: { color: colors.info, lineHeight: 20 },
  successTitle: { color: colors.success, fontSize: 20, fontWeight: "800" },
  successText: { color: colors.muted, lineHeight: 21 },
  error: { color: colors.danger, marginTop: 8 },
});
