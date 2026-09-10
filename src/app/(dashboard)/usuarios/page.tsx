import { ModuleDataPage } from "@/frontend/components/common/ModuleDataPage";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";
export const dynamic = "force-dynamic";
const columns: DataTableColumn<Record<string, unknown>>[] = [{ id: "name", header: "Nombre", accessor: "name", sortable: true }, { id: "email", header: "Correo", accessor: "email", sortable: true }, { id: "role", header: "Rol", accessor: "role" }, { id: "active", header: "Activo", accessor: "active" }, { id: "lastAccess", header: "Último acceso", accessor: "lastAccess" }];
export default async function UsersPage() { await requireModule("usuarios"); const result = await readServer(() => serverReadApi().users.list()); return <ModuleDataPage title="Usuarios" description="Gestión de usuarios y roles" data={(result.data?.items ?? []) as unknown as Record<string, unknown>[]} columns={columns} rowLabel="usuarios" searchKeys={["name", "email", "role"]} error={result.error} />; }

