import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
import {
  buildClinicalRecordFilters,
  toClinicalRecordRows,
} from "@/frontend/features/clinical-records/clinical-record-filters";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";

export const dynamic = "force-dynamic";

const columns: DataTableColumn<Record<string, unknown>>[] = [
  { id: "patient", header: "Paciente", accessor: "patient", sortable: true },
  { id: "diagnosis", header: "Diagnóstico", accessor: "diagnosis" },
  { id: "treatment", header: "Tratamiento", accessor: "treatment" },
  { id: "observations", header: "Observaciones", accessor: "observations" },
  { id: "createdAt", header: "Creado", accessor: "createdAt", sortable: true },
];

export default async function ClinicalRecordsPage() {
  await requireModule("historiales");
  const result = await readServer(() => serverReadApi().clinicalRecords.list());
  const rows = toClinicalRecordRows(result.data?.items ?? []);

  return (
    <ModuleDataPage
      title="Historiales clínicos"
      description="Expedientes clínicos de los pacientes"
      data={rows}
      columns={columns}
      rowLabel="historiales"
      searchKeys={["patient", "diagnosis", "treatment"]}
      filters={buildClinicalRecordFilters(rows)}
      error={result.error}
    />
  );
}
