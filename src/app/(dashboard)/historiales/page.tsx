import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
export const dynamic = "force-dynamic";
const columns: DataTableColumn<Record<string, unknown>>[] = [{ id: "patient", header: "Paciente", accessor: "patient", sortable: true }, { id: "diagnosis", header: "Diagnóstico", accessor: "diagnosis" }, { id: "treatment", header: "Tratamiento", accessor: "treatment" }, { id: "observations", header: "Observaciones", accessor: "observations" }, { id: "createdAt", header: "Creado", accessor: "createdAt", sortable: true }];
export default async function ClinicalRecordsPage() { const result = await readServer(() => serverReadApi().clinicalRecords.list()); return <ModuleDataPage title="Historiales clínicos" description="Expedientes clínicos de los pacientes" data={(result.data?.items ?? []) as unknown as Record<string, unknown>[]} columns={columns} rowLabel="historiales" searchKeys={["patient", "diagnosis", "treatment"]} error={result.error} />; }

