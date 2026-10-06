import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import { SuppliersManager } from "@/frontend/features/suppliers/SuppliersManager";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const user = await requireModule("proveedores");
  const result = await readServer(() => serverReadApi().suppliers.list());
  return <SuppliersManager suppliers={result.data?.items ?? []} error={result.error} canManage={user.rol === "administrador"} />;
}
