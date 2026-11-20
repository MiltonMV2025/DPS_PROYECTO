import { expect, test } from "@playwright/test";
import {
  formatPhoneInput,
  validateBirthDate,
  validateEmail,
  validateFullName,
  validatePhone,
} from "../../mobile/src/utils/validation";

test("phone mask keeps 8 digits with a dash and drops the country code of older records", () => {
  expect(formatPhoneInput("7455")).toBe("7455");
  expect(formatPhoneInput("74556612")).toBe("7455-6612");
  expect(formatPhoneInput("7455-66129999")).toBe("7455-6612");
  expect(formatPhoneInput("+503 7123 4567")).toBe("7123-4567");
  expect(formatPhoneInput("abc")).toBe("");
});

test("phone validation accepts the clinic format and rejects incomplete numbers", () => {
  expect(validatePhone("7455-6612")).toBeUndefined();
  expect(validatePhone("74556612")).toBeUndefined();
  expect(validatePhone("")).toBe("Ingresá tu número de teléfono.");
  expect(validatePhone("7455-661")).toMatch(/8 dígitos/);
});

test("birth date must be a past day", () => {
  const today = new Date(2026, 10, 19);
  expect(validateBirthDate("1998-05-30", today)).toBeUndefined();
  expect(validateBirthDate("2026-11-18", today)).toBeUndefined();
  expect(validateBirthDate("2026-11-19", today)).toMatch(/anterior a hoy/);
  expect(validateBirthDate("2027-01-01", today)).toMatch(/anterior a hoy/);
  expect(validateBirthDate("", today)).toBe("Seleccioná tu fecha de nacimiento.");
});

test("email and name validation", () => {
  expect(validateEmail(" paciente@correo.com ")).toBeUndefined();
  expect(validateEmail("paciente@correo")).toBe("Ingresá un correo electrónico válido.");
  expect(validateFullName("Ana")).toBeUndefined();
  expect(validateFullName("  A ")).toBe("Ingresá tu nombre completo.");
});
