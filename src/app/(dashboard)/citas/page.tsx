import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { RealAppointmentsTable } from "@/frontend/features/appointments/components/AppointmentsTable";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";
export const dynamic = "force-dynamic";
export default async function AppointmentsPage() {
  const result = await readServer(() => serverReadApi().appointments.list());
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citas y agenda</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consulta la agenda real · Solo lectura
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agenda de citas</CardTitle>
          <CardDescription>
            Solo lectura. No se registran cambios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.error ? <Alert variant="error"><AlertTitle>Error de datos</AlertTitle><AlertDescription>{result.error}</AlertDescription></Alert> : <RealAppointmentsTable appointments={result.data?.items ?? []} />}
        </CardContent>
      </Card>
    </section>
  );
}
