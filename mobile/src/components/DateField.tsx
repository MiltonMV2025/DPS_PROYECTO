import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AppButton, colors, uiStyles } from "@/components/ui";
import { formatDate, parseDateKey, toDateKey } from "@/utils/format";

type DateFieldProps = {
  label: string;
  /** Fecha como AAAA-MM-DD, o "" si todavía no se eligió. */
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  /** Fecha en la que se abre el selector cuando el campo está vacío. */
  initialDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
};

export function DateField({ label, value, onChange, minimumDate, maximumDate, initialDate, disabled, invalid }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const shown = value ? formatDate(parseDateKey(value)) : "";

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    // En Android el selector es un diálogo que se cierra solo; en iOS se cierra con «Listo».
    if (Platform.OS === "android") setOpen(false);
    if (event.type === "set" && date) onChange(toDateKey(date));
  }

  return (
    <View>
      <Text style={uiStyles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${shown || "sin seleccionar"}`}
        accessibilityHint="Abre el selector de fecha"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[uiStyles.input, styles.field, invalid && uiStyles.inputInvalid, disabled && styles.disabled]}
      >
        <Text style={shown ? styles.value : styles.placeholder}>{shown || "Seleccioná una fecha"}</Text>
        <Text style={styles.icon}>▾</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={value ? parseDateKey(value) : initialDate ?? maximumDate ?? new Date()}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
          locale="es-SV"
        />
      )}
      {open && Platform.OS === "ios" && <AppButton title="Listo" variant="secondary" onPress={() => setOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  value: { color: colors.navy, fontSize: 16 },
  placeholder: { color: colors.muted, fontSize: 16 },
  icon: { color: colors.muted, fontSize: 14 },
  disabled: { opacity: 0.5 },
});
