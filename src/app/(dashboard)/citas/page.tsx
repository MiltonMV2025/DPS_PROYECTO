import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { AppointmentsTable } from "@/frontend/features/appointments/components/AppointmentsTable";
export default function AppointmentsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citas y agenda</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consulta la agenda de ejemplo · Datos de demostración
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
          <AppointmentsTable />
        </CardContent>
      </Card>
    </section>
  );
}
