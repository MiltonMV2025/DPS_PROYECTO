import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createAppointment, getAvailability, listDentists } from "@/api/appointments";
import { getApiErrorMessage } from "@/api/errors";
import { Calendar } from "@/components/Calendar";
import { AppButton, AppCard, AppScreen, colors, EmptyState, ErrorState, LoadingState, SectionHeader, uiStyles } from "@/components/ui";
import type { Dentist } from "@/types/api";
import { formatDate, formatSlotDateTime, formatSlotTime, parseDateKey } from "@/utils/format";

type Selection = { start: string; end: string };

const STEPS = ["Odontólogo", "Duración", "Fecha", "Horario", "Motivo"];

export default function BookAppointmentScreen() {
  const client = useQueryClient();
  const [step, setStep] = useState(0);
  const [dentist, setDentist] = useState<Dentist | null>(null);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

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
    setStep(0);
    setDentist(null);
    setDate("");
    setDuration(30);
    setSelected(null);
    setReason("");
    setSuccess(false);
    setFormKey((value) => value + 1);
    create.reset();
  }

  const resetRef = useRef(resetForm);
  resetRef.current = resetForm;
  useFocusEffect(useCallback(() => () => resetRef.current(), []));

  if (success) {
    return <AppScreen>
      <AppCard variant="highlight">
        <Text style={styles.successTitle}>Solicitud enviada correctamente</Text>
        <Text style={styles.successText}>La clínica revisará tu solicitud y te notificará cuando sea confirmada.</Text>
        <AppButton title="Ver mis citas" onPress={() => router.replace("/(app)/appointments")} />
        <AppButton title="Solicitar otra cita" variant="secondary" onPress={resetForm} />
      </AppCard>
    </AppScreen>;
  }

  const slots = availability.data?.dentists[0]?.slots ?? [];

  return <AppScreen scroll={false} contentStyle={styles.screen}>
    <SectionHeader title="Solicitar cita" description={`Paso ${step + 1} de ${STEPS.length}: ${STEPS[step]}`} />
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: STEPS.length, now: step + 1 }} style={styles.progressTrack}>
      <View style={[styles.progressValue, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
    </View>
    <View style={styles.stepLabels}>{STEPS.map((label, index) => <Text key={label} style={[styles.stepLabel, index === step && styles.stepLabelActive]}>{index + 1}</Text>)}</View>
    <AppCard style={styles.stepCard}>
      {step === 0 && <>
        <Text style={uiStyles.label}>Elegí un odontólogo</Text>
        {dentists.isLoading && <LoadingState label="Cargando odontólogos..." />}
        {dentists.isError && <ErrorState message={getApiErrorMessage(dentists.error, "No pudimos cargar los odontólogos.")} onRetry={() => dentists.refetch()} />}
        {dentists.data?.length ? <View style={styles.options}>
          {dentists.data.map((item) => <AppButton key={item.id} title={item.name} variant={dentist?.id === item.id ? "primary" : "secondary"} onPress={() => { setDentist(item); setDate(""); setSelected(null); setStep(1); }} />)}
        </View> : dentists.data ? <EmptyState title="No hay odontólogos disponibles" description="Intentá nuevamente más tarde." /> : null}
      </>}
      {step === 1 && <>
        <Text style={uiStyles.label}>¿Cuánto tiempo necesitás?</Text>
        <View style={styles.options}>{[30, 45, 60].map((value) => <AppButton key={value} title={`${value} min`} variant={duration === value ? "primary" : "secondary"} onPress={() => { setDuration(value); setSelected(null); setStep(2); }} />)}</View>
      </>}
      {step === 2 && <>
        <Text style={uiStyles.label}>Elegí una fecha</Text>
        <Calendar key={formKey} value={date} onChange={(key) => { setDate(key); setSelected(null); setStep(3); }} />
        <Text style={styles.confirmation}>{date ? `Fecha elegida: ${formatDate(parseDateKey(date))}` : "Tocá un día del calendario para ver los horarios."}</Text>
      </>}
      {step === 3 && <>
        <Text style={uiStyles.label}>Elegí un horario</Text>
        {availability.isLoading && <LoadingState label="Buscando horarios disponibles..." />}
        {availability.isError && <ErrorState message={getApiErrorMessage(availability.error, "No pudimos consultar la disponibilidad.")} onRetry={() => availability.refetch()} />}
        {availability.data && (slots.length ? <ScrollView style={styles.slotScroll} contentContainerStyle={styles.options} showsVerticalScrollIndicator>{slots.map((slot) => <AppButton key={slot.start} title={`${formatSlotTime(slot.start)} - ${formatSlotTime(slot.end)}`} variant="secondary" onPress={() => { setSelected({ start: slot.start, end: slot.end }); setStep(4); }} />)}</ScrollView> : <EmptyState title="No hay horarios disponibles" description="Volvé y probá con otra fecha o duración." />)}
      </>}
      {step === 4 && selected && <>
        <Text style={uiStyles.label}>Motivo de la consulta</Text>
        <TextInput autoFocus placeholder="Consulta, limpieza, control..." maxLength={150} value={reason} onChangeText={setReason} multiline style={[uiStyles.input, uiStyles.multiline]} />
        <Text style={styles.counter}>{reason.length}/150</Text>
        <View style={styles.summary}>
          <Text style={styles.confirmation}>Odontólogo: {dentist?.name}</Text>
          <Text style={styles.confirmation}>Fecha: {formatSlotDateTime(selected.start)}</Text>
          <Text style={styles.confirmation}>Horario: {formatSlotTime(selected.start)} - {formatSlotTime(selected.end)} ({duration} min)</Text>
        </View>
        <AppButton title="Enviar solicitud" loading={create.isPending} onPress={() => create.mutate()} />
        {create.isError && <Text style={styles.error}>{getApiErrorMessage(create.error, "No pudimos enviar la solicitud.")}</Text>}
      </>}
    </AppCard>
    {step > 0 && <AppButton title="Volver" variant="secondary" onPress={() => setStep((current) => current - 1)} />}
  </AppScreen>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: colors.border, overflow: "hidden" },
  progressValue: { height: "100%", borderRadius: 999, backgroundColor: colors.primary },
  stepLabels: { flexDirection: "row", justifyContent: "space-between" },
  stepLabel: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  stepLabelActive: { color: colors.primary },
  stepCard: { flex: 1 },
  slotScroll: { flex: 1 },
  options: { gap: 10 },
  summary: { gap: 4, paddingVertical: 4 },
  counter: { color: colors.muted, textAlign: "right", fontSize: 12 },
  confirmation: { color: colors.info, lineHeight: 20 },
  successTitle: { color: colors.success, fontSize: 20, fontWeight: "800" },
  successText: { color: colors.muted, lineHeight: 21 },
  error: { color: colors.danger, marginTop: 8 },
});
