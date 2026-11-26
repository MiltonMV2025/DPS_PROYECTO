import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/ui";
import { MONTHS_LONG, parseDateKey, toDateKey } from "@/utils/format";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

type Props = {
  /** Fecha elegida como AAAA-MM-DD, o "" si no hay. */
  value: string;
  onChange: (dateKey: string) => void;
  /** Primer dia seleccionable (por defecto, hoy). */
  minDate?: Date;
  /** Ultimo dia seleccionable (por defecto, 90 dias desde hoy). */
  maxDate?: Date;
};

function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

export function Calendar({ value, onChange, minDate, maxDate }: Props) {
  const min = startOfDay(minDate ?? new Date());
  const max = maxDate ? startOfDay(maxDate) : new Date(min.getFullYear(), min.getMonth(), min.getDate() + 90);
  const initial = value ? parseDateKey(value) : min;
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));

  const canGoPrev = new Date(month.getFullYear(), month.getMonth(), 0) >= min;
  const canGoNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= max;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" disabled={!canGoPrev} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={[styles.nav, !canGoPrev && styles.navDisabled]}><Text style={styles.navText}>‹</Text></Pressable>
        <Text style={styles.monthTitle}>{MONTHS_LONG[month.getMonth()]} {month.getFullYear()}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" disabled={!canGoNext} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={[styles.nav, !canGoNext && styles.navDisabled]}><Text style={styles.navText}>›</Text></Pressable>
      </View>
      <View style={styles.row}>{WEEKDAYS.map((day, index) => <Text key={index} style={styles.weekday}>{day}</Text>)}</View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((day, dayIndex) => {
            if (!day) return <View key={dayIndex} style={styles.cell} />;
            const key = toDateKey(day);
            const disabled = day < min || day > max;
            const selected = key === value;
            return (
              <Pressable key={dayIndex} accessibilityRole="button" accessibilityLabel={`${day.getDate()} de ${MONTHS_LONG[day.getMonth()]} de ${day.getFullYear()}`} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => onChange(key)} style={styles.cell}>
                <View style={[styles.day, selected && styles.daySelected]}>
                  <Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.dayTextSelected]}>{day.getDate()}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  monthTitle: { color: colors.navy, fontWeight: "700", fontSize: 16, textTransform: "capitalize" },
  nav: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.infoBackground },
  navDisabled: { opacity: 0.35 },
  navText: { color: colors.navy, fontSize: 22, lineHeight: 24 },
  row: { flexDirection: "row" },
  weekday: { flex: 1, textAlign: "center", color: colors.muted, fontWeight: "700", fontSize: 12 },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  daySelected: { backgroundColor: colors.primary },
  dayText: { color: colors.navy, fontSize: 15 },
  dayDisabled: { color: "#B8C4CE" },
  dayTextSelected: { color: colors.white, fontWeight: "700" },
});
