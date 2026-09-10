import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Progress } from "@/frontend/components/ui/progress";
import { RealAppointmentsTable } from "@/frontend/features/appointments/components/AppointmentsTable";
import { readServer, serverReadApi } from "@/frontend/lib/server-read";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";

const metricLabels = [
  {
    label: "Citas de hoy",
    key: "appointmentsToday" as const,
    detail: "Citas no canceladas",
    icon: CalendarDays,
  },
  {
    label: "Pacientes activos",
    key: "activePatients" as const,
    detail: "Usuarios activos con ficha",
    icon: Users,
  },
  {
    label: "Ingresos del mes",
    key: "monthlyRevenue" as const,
    detail: "Facturación pagada",
    icon: Activity,
  },
  {
    label: "Insumos por reponer",
    key: "suppliesToRestock" as const,
    detail: "Stock bajo el mínimo",
    icon: Package,
  },
];
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const api = serverReadApi();
  const [dashboard, appointments] = await Promise.all([
    readServer(() => api.dashboard.get()),
    readServer(() => api.appointments.list()),
  ]);
  const metrics = dashboard.data;
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Resumen general
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Una vista rápida de Sonrisa Digital · Datos reales de solo lectura
          </p>
        </div>
        <Button asChild>
          <Link href="/citas">
            Ver agenda
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <section aria-labelledby="analytics-title" className="w-full space-y-4">
        <h2 id="analytics-title" className="text-lg font-semibold">
          Análisis rápido
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricLabels.map(({ label, key, detail, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div>
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{key === "monthlyRevenue" ? `$${(metrics?.[key] ?? 0).toLocaleString("en-US")}` : (metrics?.[key] ?? 0).toLocaleString("es-SV")}</p>
                  <p className="mt-1 text-xs text-slate-600">{detail}</p>
                </div>
                <div className="rounded-lg bg-primary-light p-2.5 text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {dashboard.error && <Alert variant="error"><AlertTitle>Error de métricas</AlertTitle><AlertDescription>{dashboard.error}</AlertDescription></Alert>}
        <Card>
          <CardHeader>
            <CardTitle>Análisis operativo</CardTitle>
            <CardDescription>
              Indicadores calculados desde la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {[{ label: "Ocupación de agenda", value: metrics?.occupancy ?? 0 }, { label: "Confirmación de citas", value: metrics?.confirmationRate ?? 0 }].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <Progress value={value} aria-label={label} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section aria-labelledby="appointments-title" className="w-full min-w-0">
        <Card>
          <CardHeader>
            <CardTitle id="appointments-title">Próximas citas</CardTitle>
            <CardDescription>Próximas citas no canceladas · Solo lectura</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.error ? <Alert variant="error"><AlertTitle>Error de datos</AlertTitle><AlertDescription>{appointments.error}</AlertDescription></Alert> : <RealAppointmentsTable appointments={appointments.data?.items ?? []} />}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
