"use client";

import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { Badge } from "@/frontend/components/ui/badge";
import type { PatientClinicalRecord } from "@/backend/modules/patient-profile/profile.types";

type ClinicalRecordsTableProps = {
  records: PatientClinicalRecord[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-SV", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const statusLabels: Record<string, { label: string; variant: "success" | "info" | "error" }> = {
  pendiente: { label: "Pendiente", variant: "info" },
  confirmada: { label: "Confirmada", variant: "success" },
  completada: { label: "Completada", variant: "success" },
  cancelada: { label: "Cancelada", variant: "error" },
};

const clinicalColumns: DataTableColumn<PatientClinicalRecord>[] = [
  {
    id: "appointmentDate",
    header: "Fecha de cita",
    accessor: "appointmentDate",
    sortable: false,
    cell: (value) => formatDate(String(value)),
  },
  {
    id: "dentist",
    header: "Médico tratante",
    accessor: "dentist",
    sortable: false,
  },
  {
    id: "reason",
    header: "Motivo",
    accessor: "reason",
    sortable: false,
    cell: (value) => (value ? String(value) : "Consulta"),
  },
  {
    id: "durationMin",
    header: "Duración",
    accessor: "durationMin",
    sortable: false,
    cell: (value) => `${value} min`,
  },
  {
    id: "appointmentStatus",
    header: "Estado de cita",
    accessor: "appointmentStatus",
    sortable: false,
    cell: (value) => { const status = statusLabels[String(value)] ?? { label: String(value), variant: "info" as const }; return <Badge variant={status.variant}>{status.label}</Badge>; },
  },
  {
    id: "diagnosis",
    header: "Diagnóstico",
    accessor: "diagnosis",
    sortable: false,
  },
  {
    id: "treatment",
    header: "Tratamiento",
    accessor: "treatment",
    sortable: false,
  },
  {
    id: "observations",
    header: "Observaciones",
    accessor: "observations",
    sortable: false,
    cell: (value) => (value ? String(value) : "—"),
  },
  { id: "prescription", header: "Receta", accessor: "prescription", sortable: false, cell: (value) => value ? String(value) : "—" },
  { id: "recommendations", header: "Recomendaciones", accessor: "recommendations", sortable: false, cell: (value) => value ? String(value) : "—" },
  {
    id: "createdAt",
    header: "Registrado",
    accessor: "createdAt",
    sortable: false,
    cell: (value) => formatDate(String(value)),
  },
];

export function ClinicalRecordsTable({ records }: ClinicalRecordsTableProps) {
  return (
    <DataTable
      columns={
        clinicalColumns as unknown as DataTableColumn<Record<string, unknown>>[]
      }
      data={records as unknown as Record<string, unknown>[]}
      getRowId={(row) => String((row as unknown as PatientClinicalRecord).id)}
      caption="Registros clínicos"
      rowLabel="registros clínicos"
    />
  );
}
