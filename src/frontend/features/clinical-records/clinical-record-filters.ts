import type { ClinicalRecordListItem } from "@/backend/modules/read-models";
import type { DataTableFilter } from "@/frontend/components/ui/data-table";

export type ClinicalRecordRow = ClinicalRecordListItem & {
  treatmentType: string;
};

type Option = { label: string; value: string };

/**
 * `tratamiento` es texto libre en la base de datos, así que se agrupa por
 * palabras clave. El orden importa: gana la primera categoría que coincida,
 * por eso van primero las más específicas.
 */
const treatmentTypes: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: "Blanqueamiento", pattern: /blanqueamiento/ },
  {
    label: "Endodoncia",
    pattern: /endodoncia|conducto|pulpectomia|pulpotomia/,
  },
  {
    label: "Extracción y cirugía",
    pattern: /exodoncia|extraccion|cirug|sutura|cordal|apicectomia/,
  },
  {
    label: "Ortodoncia",
    pattern: /ortodoncia|bracket|arco|ligadura|retenedor|alineador/,
  },
  {
    label: "Prótesis e implantes",
    pattern: /protesis|corona|puente|implante|carilla/,
  },
  {
    label: "Obturación y restauración",
    pattern: /obturacion|restauracion|resina|empaste|incrustacion|caries/,
  },
  {
    label: "Periodoncia",
    pattern: /periodon|gingiv|curetaje|raspado|alisado/,
  },
  {
    label: "Limpieza y profilaxis",
    pattern: /profilaxis|limpieza|pulido|fluor|detartraje/,
  },
  {
    label: "Control y revisión",
    pattern: /control|revision|evaluacion|valoracion|consulta/,
  },
];

const otherTreatmentType = "Otros";

// Días hacia atrás desde hoy; los interpreta el filtro de tipo "recent".
export const recentDateOptions: ReadonlyArray<Option> = [
  { label: "Últimos 7 días", value: "7" },
  { label: "Últimos 30 días", value: "30" },
  { label: "Últimos 3 meses", value: "90" },
  { label: "Último año", value: "365" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getTreatmentType(treatment: string) {
  const text = normalize(treatment);
  return (
    treatmentTypes.find((type) => type.pattern.test(text))?.label ??
    otherTreatmentType
  );
}

export function toClinicalRecordRows(
  records: readonly ClinicalRecordListItem[],
): ClinicalRecordRow[] {
  return records.map((record) => ({
    ...record,
    treatmentType: getTreatmentType(record.treatment),
  }));
}

/**
 * Filtros de solo lectura para la tabla de historiales. Las opciones salen de
 * los datos reales, así que nunca se ofrece un valor que devuelva cero filas
 * (salvo los rangos de fecha, que son fijos).
 */
export function buildClinicalRecordFilters(
  rows: readonly ClinicalRecordRow[],
): DataTableFilter<Record<string, unknown>>[] {
  const patients = Array.from(
    new Set(rows.map((row) => row.patient).filter(Boolean)),
  )
    .sort((first, second) => first.localeCompare(second, "es"))
    .map((name) => ({ label: name, value: name }));

  const presentTypes = new Set(rows.map((row) => row.treatmentType));
  const treatmentOptions = [
    ...treatmentTypes.map((type) => type.label),
    otherTreatmentType,
  ]
    .filter((label) => presentTypes.has(label))
    .map((label) => ({ label, value: label }));

  return [
    {
      id: "patient",
      label: "Paciente",
      accessor: "patient",
      options: patients,
    },
    {
      id: "treatmentType",
      label: "Tipo de tratamiento",
      accessor: "treatmentType",
      options: treatmentOptions,
    },
    {
      id: "createdAt",
      label: "Fecha",
      accessor: "createdAt",
      kind: "recent",
      options: [...recentDateOptions],
    },
  ];
}
