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
import { AppointmentsTable } from "@/frontend/features/appointments/components/AppointmentsTable";

const metrics = [
  {
    label: "Citas de hoy",
    value: "24",
    detail: "+12% vs. ayer",
    icon: CalendarDays,
  },
  {
    label: "Pacientes activos",
    value: "1,248",
    detail: "+8% este mes",
    icon: Users,
  },
  {
    label: "Ingresos del mes",
    value: "$18,450",
    detail: "+16% vs. mes anterior",
    icon: Activity,
  },
  {
    label: "Insumos por reponer",
    value: "7",
    detail: "Requieren atención",
    icon: Package,
  },
];
const indicators = [
  { label: "Ocupación de agenda", value: 78 },
  { label: "Confirmación de citas", value: 64 },
  { label: "Meta mensual", value: 91 },
];

export default function DashboardPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Resumen general
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Una vista rápida de Sonrisa Digital · Datos de demostración
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
          {metrics.map(({ label, value, detail, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div>
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-slate-600">{detail}</p>
                </div>
                <div className="rounded-lg bg-primary-light p-2.5 text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Análisis operativo</CardTitle>
            <CardDescription>
              Indicadores de seguimiento de ejemplo
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {indicators.map(({ label, value }) => (
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
            <CardDescription>Agenda de ejemplo · Solo lectura</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsTable />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
