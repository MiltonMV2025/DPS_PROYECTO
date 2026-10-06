import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { requireModule } from "@/frontend/lib/session";
import { PatientsManager } from "@/frontend/features/patients/PatientsManager";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  await requireModule("pacientes");
  const result = await readServer(() => serverReadApi().patients.list());
  return <PatientsManager patients={result.data?.items ?? []} error={result.error} />;
}
