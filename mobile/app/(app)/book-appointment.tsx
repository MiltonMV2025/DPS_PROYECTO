import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, TextInput, View, type ScrollView } from "react-native";
import { createAppointment, getAvailability, listDentists } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { Calendar } from "@/components/Calendar";
import { AppButton, AppCard, AppScreen, colors, EmptyState, ErrorState, LoadingState, SectionHeader, uiStyles } from "@/components/ui";
import type { Dentist } from "@/types/api";
import { formatDate, formatSlotDateTime, formatSlotTime, parseDateKey } from "@/utils/format";

type Selection = { start: string; end: string };

export default function BookAppointmentScreen() {
  const client = useQueryClient();
  const [dentist, setDentist] = useState<Dentist | null>(null);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pendingScroll = useRef<"slots" | "reason" | null>(null);

  function scrollToSection(section: "slots" | "reason", y: number) {
    if (pendingScroll.current !== section) return;
    pendingScroll.current = null;
    scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
  }

  const dentists = useQuery({ queryKey: ["dentists"], queryFn: listDentists });
  const availability = useQuery({
    queryKey: ["availability", dentist?.id, date, duration],
    queryFn: () => getAvailability({ date, duracionMin: duration, idOdontologo: dentist!.id }),
    enabled: dentist != null && date !== "",
  });
  const create = useMutation({
    mutationFn: () => createAppointment({ idOdontologo: dentist!.id, fechaHora: selected!.start, duracionMin: duration, motivo: reason }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["appointments"] });
      setSuccess(true);
      setSelected(null);
    },
  });

  function resetForm() {
    setDentist(null);
    setDate("");
    setDuration(30);
    setSelected(null);
    setReason("");
    setSuccess(false);
    pendingScroll.current = null;
    setFormKey((value) => value + 1);
    create.reset();
  }

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

  const slots = availability.data?.dentists[0]?.slots ?? [];

  return (
    <AppScreen scrollRef={scrollRef}>
      <SectionHeader title="Solicitar cita" description="Elegí un odontólogo, una fecha, un horario y contanos el motivo de tu consulta." />
      <AppCard>
        <Text style={uiStyles.label}>1. Odontólogo</Text>
        {dentists.isLoading && <LoadingState label="Cargando odontólogos..." />}
        {dentists.isError && <ErrorState message={getApiErrorMessage(dentists.error, "No pudimos cargar los odontólogos.")} onRetry={() => dentists.refetch()} />}
        {dentists.data?.length ? <View style={styles.options}>
          {dentists.data.map((item) => <AppButton key={item.id} title={item.name} variant={dentist?.id === item.id ? "primary" : "secondary"} onPress={() => { setDentist(item); setDate(""); setSelected(null); }} />)}
        </View> : dentists.data ? <EmptyState title="No hay odontólogos disponibles" description="Intentá nuevamente más tarde." /> : null}
      </AppCard>
      <AppCard>
        <Text style={uiStyles.label}>2. Duración</Text>
        <View style={styles.options}>
          {[30, 45, 60].map((value) => <AppButton key={value} title={`${value} min`} variant={duration === value ? "primary" : "secondary"} onPress={() => { setDuration(value); setSelected(null); }} />)}
        </View>
      </AppCard>
      {dentist && <AppCard>
        <Text style={uiStyles.label}>3. Fecha</Text>
        <Calendar key={formKey} value={date} onChange={(key) => { pendingScroll.current = "slots"; setDate(key); setSelected(null); }} />
        <Text style={styles.confirmation}>{date ? `Fecha elegida: ${formatDate(parseDateKey(date))}` : "Tocá un día del calendario para ver los horarios."}</Text>
      </AppCard>}
      <View onLayout={(event) => scrollToSection("slots", event.nativeEvent.layout.y)}>
        {availability.isLoading && <LoadingState label="Buscando horarios disponibles..." />}
        {availability.isError && <ErrorState message={getApiErrorMessage(availability.error, "No pudimos consultar la disponibilidad.")} onRetry={() => availability.refetch()} />}
        {availability.data && <AppCard>
          <Text style={uiStyles.label}>4. Horario disponible</Text>
          {slots.length ? <View style={styles.slots}>
            {slots.map((slot) => <AppButton key={slot.start} title={`${formatSlotTime(slot.start)} - ${formatSlotTime(slot.end)}`} variant={selected?.start === slot.start ? "primary" : "secondary"} onPress={() => { pendingScroll.current = "reason"; setSelected({ start: slot.start, end: slot.end }); }} />)}
          </View> : <EmptyState title="No hay horarios disponibles" description="Probá con otra fecha o duración." />}
        </AppCard>}
      </View>
      {selected && <View onLayout={(event) => scrollToSection("reason", event.nativeEvent.layout.y)}>
        <AppCard>
          <Text style={uiStyles.label}>5. Motivo de la consulta</Text>
          <TextInput placeholder="Consulta, limpieza, control..." maxLength={150} value={reason} onChangeText={setReason} multiline style={[uiStyles.input, uiStyles.multiline]} />
          <Text style={styles.counter}>{reason.length}/150</Text>
          <Text style={styles.confirmation}>Odontólogo: {dentist?.name}</Text>
          <Text style={styles.confirmation}>Fecha: {formatSlotDateTime(selected.start)}</Text>
          <Text style={styles.confirmation}>Horario: {formatSlotTime(selected.start)} - {formatSlotTime(selected.end)} ({duration} min)</Text>
          <AppButton title="Enviar solicitud" loading={create.isPending} onPress={() => create.mutate()} />
          {create.isError && <Text style={styles.error}>{getApiErrorMessage(create.error, "No pudimos enviar la solicitud.")}</Text>}
        </AppCard>
      </View>}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  options: { gap: 10 },
  slots: { gap: 8 },
  counter: { color: colors.muted, textAlign: "right", fontSize: 12 },
  confirmation: { color: colors.info, lineHeight: 20 },
  successTitle: { color: colors.success, fontSize: 20, fontWeight: "800" },
  successText: { color: colors.muted, lineHeight: 21 },
  error: { color: colors.danger, marginTop: 8 },
});
