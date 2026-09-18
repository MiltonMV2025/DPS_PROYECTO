import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import { UsersManager } from "@/frontend/features/users/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireModule("usuarios");
  const result = await readServer(() => serverReadApi().users.list());
  return <UsersManager users={result.data?.items ?? []} error={result.error} />;
}
