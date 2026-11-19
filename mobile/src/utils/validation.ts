/** Teléfono de 8 dígitos con guion (7455-6612), el mismo formato que usa el panel web. */
const PHONE_PATTERN = /^\d{4}-\d{4}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Aplica la máscara 0000-0000 mientras el usuario escribe. */
export function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, "");
  // Teléfonos guardados antes con código de país (+503 7123 4567).
  if (digits.length > 8 && digits.startsWith("503")) digits = digits.slice(3);
  digits = digits.slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

export function validatePhone(value: string) {
  if (!value.trim()) return "Ingresá tu número de teléfono.";
  if (!PHONE_PATTERN.test(formatPhoneInput(value))) return "El teléfono debe tener 8 dígitos, por ejemplo 7455-6612.";
  return undefined;
}

export function validateEmail(value: string) {
  if (!value.trim()) return "Ingresá tu correo electrónico.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Ingresá un correo electrónico válido.";
  return undefined;
}

export function validateFullName(value: string) {
  if (value.trim().length < 3) return "Ingresá tu nombre completo.";
  return undefined;
}

/** La fecha de nacimiento llega como AAAA-MM-DD desde el selector y no puede ser futura. */
export function validateBirthDate(value: string, today = new Date()) {
  if (!value) return "Seleccioná tu fecha de nacimiento.";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(date.getTime()) || date >= startOfToday) return "La fecha de nacimiento debe ser anterior a hoy.";
  return undefined;
}
