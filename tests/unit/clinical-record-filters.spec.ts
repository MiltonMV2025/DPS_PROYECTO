import { expect, test } from "@playwright/test";
import {
  buildClinicalRecordFilters,
  getTreatmentType,
  recentDateOptions,
  toClinicalRecordRows,
} from "../../src/frontend/features/clinical-records/clinical-record-filters";

const record = (
  id: number,
  patient: string,
  treatment: string,
  createdAt = "2026-09-09T14:12:00.000Z",
) => ({
  id,
  appointmentId: id,
  patient,
  diagnosis: "Diagnóstico",
  treatment,
  observations: null,
  createdAt,
});

test("treatments from the seed data land in the expected type", () => {
  expect(getTreatmentType("Profilaxis y aplicación de flúor")).toBe(
    "Limpieza y profilaxis",
  );
  expect(getTreatmentType("Exodoncia quirúrgica con sutura")).toBe(
    "Extracción y cirugía",
  );
  expect(getTreatmentType("Ajuste de arco y cambio de ligaduras")).toBe(
    "Ortodoncia",
  );
  expect(getTreatmentType("Obturación con resina compuesta A2")).toBe(
    "Obturación y restauración",
  );
  expect(getTreatmentType("Control y pulido")).toBe("Limpieza y profilaxis");
});

test("classification ignores accents and case, and falls back to Otros", () => {
  expect(getTreatmentType("ENDODONCIA molar")).toBe("Endodoncia");
  expect(getTreatmentType("Blanqueamiento con limpieza previa")).toBe(
    "Blanqueamiento",
  );
  expect(getTreatmentType("Tratamiento especial")).toBe("Otros");
  expect(getTreatmentType("")).toBe("Otros");
});

test("filters expose sorted patients and only the treatment types present", () => {
  const rows = toClinicalRecordRows([
    record(1, "María Elena Sosa", "Exodoncia quirúrgica"),
    record(2, "Ana Lucía Flores", "Ajuste de arco"),
    record(3, "María Elena Sosa", "Extracción simple"),
    record(4, "Karla Beltrán", "Algo distinto"),
  ]);
  const [patient, treatmentType, date] = buildClinicalRecordFilters(rows);

  expect(patient.options.map((option) => option.value)).toEqual([
    "Ana Lucía Flores",
    "Karla Beltrán",
    "María Elena Sosa",
  ]);
  expect(treatmentType.options.map((option) => option.value)).toEqual([
    "Extracción y cirugía",
    "Ortodoncia",
    "Otros",
  ]);
  expect(date.kind).toBe("recent");
  expect(date.options).toEqual([...recentDateOptions]);
});

test("filters are empty-safe when there are no records", () => {
  const [patient, treatmentType] = buildClinicalRecordFilters([]);
  expect(patient.options).toEqual([]);
  expect(treatmentType.options).toEqual([]);
});
