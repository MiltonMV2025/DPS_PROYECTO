import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
export const dynamic = "force-dynamic";
const columns: DataTableColumn<Record<string, unknown>>[] = [{ id: "name", header: "Nombre", accessor: "name", sortable: true }, { id: "email", header: "Correo", accessor: "email", sortable: true }, { id: "phone", header: "Teléfono", accessor: "phone" }, { id: "birthDate", header: "Nacimiento", accessor: "birthDate" }, { id: "allergies", header: "Alergias", accessor: "allergies" }];
export default async function PatientsPage() { await requireModule("pacientes"); const result = await readServer(() => serverReadApi().patients.list()); return <ModuleDataPage title="Pacientes" description="Gestión de pacientes de la clínica" data={(result.data?.items ?? []) as unknown as Record<string, unknown>[]} columns={columns} rowLabel="pacientes" searchKeys={["name", "email"]} error={result.error} />; }

