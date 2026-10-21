const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MONTHS_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const SHORT_BY_NAME: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const pad = (value: number) => String(value).padStart(2, "0");

/** Fecha local como AAAA-MM-DD (formato que espera el backend). */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Convierte AAAA-MM-DD en una fecha local a medianoche. */
export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Formato unico de fecha en toda la app: 20 oct 2026. */
export function formatDate(date: Date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** Formato unico de hora en toda la app: 4:30 p. m. */
export function formatTime(hours: number, minutes: number) {
  const suffix = hours >= 12 ? "p. m." : "a. m.";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${suffix}`;
}

/** Fecha y hora de una cita (instante real): 12 oct 2026, 4:30 p. m. */
export function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${formatDate(date)}, ${formatTime(date.getHours(), date.getMinutes())}`;
}

/** Hora de un horario que el backend envia sin zona (AAAA-MM-DDTHH:MM:SS): se lee tal cual, sin convertir. */
export function formatSlotTime(value: string) {
  const match = /(\d{2}):(\d{2})/.exec(value.slice(10));
  return match ? formatTime(Number(match[1]), Number(match[2])) : value;
}

/** Fecha y hora de un horario disponible, leidas tal cual (sin zona horaria). */
export function formatSlotDateTime(value: string) {
  return `${formatDate(parseDateKey(value.slice(0, 10)))}, ${formatSlotTime(value)}`;
}

/**
 * Fecha sin hora (por ejemplo, nacimiento). El backend puede enviar AAAA-MM-DD,
 * un ISO o el texto de Date.toString ("Tue Sep 29 2026 00:00:00 GMT-0600 ...").
 * Se toman dia, mes y anio del texto para no depender de la zona horaria.
 */
export function formatDateOnly(value: string | null | undefined) {
  if (!value) return "No registrada";
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return formatDate(new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
  const text = /^[A-Za-z]{3} ([A-Za-z]{3}) (\d{1,2}) (\d{4})/.exec(value);
  if (text && text[1] in SHORT_BY_NAME) return formatDate(new Date(Number(text[3]), SHORT_BY_NAME[text[1]], Number(text[2])));
  return value;
}
