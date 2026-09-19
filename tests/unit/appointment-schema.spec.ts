import { expect, test } from "@playwright/test";
import { updateAppointmentSchema } from "../../src/backend/modules/appointments/appointment.schema";

const complete = {
  estado: "completada",
  diagnostico: "Caries oclusal en pieza 36",
  tratamiento: "Obturación con resina compuesta",
  observaciones: "Sin complicaciones",
};

test("completing an appointment requires diagnosis, treatment and observations", () => {
  const result = updateAppointmentSchema.safeParse({ estado: "completada" });
  expect(result.success).toBe(false);
  const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
  expect(fields).toEqual(["diagnostico", "tratamiento", "observaciones"]);
});

test("blank diagnosis or treatment does not satisfy the requirement", () => {
  const result = updateAppointmentSchema.safeParse({ ...complete, diagnostico: "   ", tratamiento: "\n" });
  expect(result.success).toBe(false);
  const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
  expect(fields).toEqual(["diagnostico", "tratamiento"]);
});

test("a complete payload is accepted and trimmed", () => {
  const result = updateAppointmentSchema.safeParse({ ...complete, diagnostico: "  Gingivitis  " });
  expect(result.success).toBe(true);
  expect(result.success && result.data.diagnostico).toBe("Gingivitis");
});

test("other status changes do not ask for clinical data", () => {
  expect(updateAppointmentSchema.safeParse({ estado: "confirmada" }).success).toBe(true);
  expect(updateAppointmentSchema.safeParse({ estado: "cancelada" }).success).toBe(true);
});
