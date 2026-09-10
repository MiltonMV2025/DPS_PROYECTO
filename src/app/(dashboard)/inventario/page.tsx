import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
export const dynamic = "force-dynamic";
const columns: DataTableColumn<Record<string, unknown>>[] = [{ id: "name", header: "Insumo", accessor: "name", sortable: true }, { id: "category", header: "Categoría", accessor: "category" }, { id: "currentStock", header: "Actual", accessor: "currentStock", sortable: true }, { id: "minimumStock", header: "Mínimo", accessor: "minimumStock" }, { id: "supplier", header: "Proveedor", accessor: "supplier" }, { id: "stockStatus", header: "Estado", accessor: "stockStatus" }];
export default async function InventoryPage() { const result = await readServer(() => serverReadApi().inventory.list()); return <ModuleDataPage title="Inventario" description="Control de insumos y existencias" data={(result.data?.items ?? []) as unknown as Record<string, unknown>[]} columns={columns} rowLabel="insumos" searchKeys={["name", "category"]} error={result.error} />; }

