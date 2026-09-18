import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import { InventoryManager } from "@/frontend/features/inventory/InventoryManager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireModule("inventario");

  const [inventoryResult, suppliersResult] = await Promise.all([
    readServer(() => serverReadApi().inventory.list()),
    readServer(() => serverReadApi().suppliers.list()),
  ]);

  return (
    <InventoryManager
      items={inventoryResult.data?.items ?? []}
      suppliers={suppliersResult.data?.items ?? []}
      error={inventoryResult.error ?? suppliersResult.error}
    />
  );
}
