import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { AppointmentsManager } from "@/frontend/features/appointments/components/AppointmentsManager";
import { requireModule } from "@/frontend/lib/session";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const user = await requireModule("citas");
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citas y agenda</h1>
        <p className="mt-2 text-sm text-slate-600">Gestión de la agenda de la clínica</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agenda de citas</CardTitle>
          <CardDescription>Próximas citas y registro de nuevas.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentsManager role={user.rol} />
        </CardContent>
      </Card>
    </section>
  );
}
