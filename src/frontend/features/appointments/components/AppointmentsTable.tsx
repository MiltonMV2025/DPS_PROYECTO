"use client";

import { Eye, Info } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/frontend/components/ui/alert";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/frontend/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";

type AppointmentRow = {
  id: string;
  time: string;
  patient: string;
  service: string;
  status: "Confirmada" | "Pendiente" | "Cancelada";
};
const appointments: AppointmentRow[] = [
  {
    id: "demo-1",
    time: "08:30",
    patient: "Ana Martínez",
    service: "Limpieza dental",
    status: "Confirmada",
  },
  {
    id: "demo-2",
    time: "10:00",
    patient: "Carlos López",
    service: "Consulta general",
    status: "Pendiente",
  },
  {
    id: "demo-3",
    time: "11:30",
    patient: "Sofía Hernández",
    service: "Control de ortodoncia",
    status: "Confirmada",
  },
  {
    id: "demo-4",
    time: "15:00",
    patient: "Miguel Rivera",
    service: "Evaluación inicial",
    status: "Pendiente",
  },
  {
    id: "demo-5",
    time: "16:00",
    patient: "Lucía Torres",
    service: "Consulta general",
    status: "Cancelada",
  },
];
const statusVariants = {
  Confirmada: "success",
  Pendiente: "info",
  Cancelada: "error",
} as const;

function AppointmentDetails({ appointment }: { appointment: AppointmentRow }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Ver cita de ${appointment.patient}`}
        >
          <Eye aria-hidden="true" className="h-4 w-4" />
          <span>Ver</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de cita</DialogTitle>
          <DialogDescription>
            Información de ejemplo de la agenda. Solo lectura.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-slate-600">Paciente</dt>
          <dd className="font-medium">{appointment.patient}</dd>
          <dt className="text-slate-600">Hora</dt>
          <dd>{appointment.time}</dd>
          <dt className="text-slate-600">Servicio</dt>
          <dd>{appointment.service}</dd>
          <dt className="text-slate-600">Estado</dt>
          <dd>
            <Badge variant={statusVariants[appointment.status]}>
              {appointment.status}
            </Badge>
          </dd>
        </dl>
        <Alert>
          <Info aria-hidden="true" />
          <AlertTitle>Vista de demostración</AlertTitle>
          <AlertDescription>
            Estos datos son ficticios. No se registran ni modifican citas desde
            esta vista.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cerrar detalle</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
const columns: DataTableColumn<AppointmentRow>[] = [
  { id: "time", header: "Hora", accessor: "time", sortable: true },
  { id: "patient", header: "Paciente", accessor: "patient", sortable: true },
  { id: "service", header: "Servicio", accessor: "service", sortable: false },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    sortable: true,
    cell: (_value, row) => (
      <Badge variant={statusVariants[row.status]}>{row.status}</Badge>
    ),
  },
  {
    id: "details",
    header: "Detalle",
    accessor: "id",
    sortable: false,
    cell: (_value, row) => <AppointmentDetails appointment={row} />,
  },
];
export function AppointmentsTable() {
  return (
    <DataTable
      columns={columns}
      data={appointments}
      getRowId={(row) => row.id}
      caption="Citas de demostración"
      searchKeys={["patient", "service"]}
      searchPlaceholder="Buscar paciente o servicio..."
      filters={[
        {
          id: "status",
          label: "Estado",
          accessor: "status",
          options: [
            { label: "Confirmadas", value: "Confirmada" },
            { label: "Pendientes", value: "Pendiente" },
            { label: "Canceladas", value: "Cancelada" },
          ],
        },
      ]}
      rowLabel="citas"
    />
  );
}
