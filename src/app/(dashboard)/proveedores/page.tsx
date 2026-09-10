import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
export const dynamic = "force-dynamic";
const columns: DataTableColumn<Record<string, unknown>>[] = [{ id: "businessName", header: "Razón social", accessor: "businessName", sortable: true }, { id: "category", header: "Categoría", accessor: "category" }, { id: "contact", header: "Contacto", accessor: "contact" }, { id: "phone", header: "Teléfono", accessor: "phone" }, { id: "status", header: "Estado", accessor: "status" }];
export default async function SuppliersPage() { const result = await readServer(() => serverReadApi().suppliers.list()); return <ModuleDataPage title="Proveedores" description="Gestión de proveedores de la clínica" data={(result.data?.items ?? []) as unknown as Record<string, unknown>[]} columns={columns} rowLabel="proveedores" searchKeys={["businessName", "category"]} error={result.error} />; }

