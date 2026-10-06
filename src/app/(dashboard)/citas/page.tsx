import { AppointmentsManager } from "@/frontend/features/appointments/components/AppointmentsManager";
import { requireModule } from "@/frontend/lib/session";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const user = await requireModule("citas");
  return (
    <section className="space-y-6">
      <AppointmentsManager role={user.rol} />
    </section>
  );
}
