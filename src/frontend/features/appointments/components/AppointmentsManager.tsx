"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { UserRole } from "@/backend/database/entities";
import { ToastAlert } from "@/frontend/components/common/ToastAlert";
import { ActionMenu } from "@/frontend/components/common/ActionMenu";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { CompleteAppointmentDialog } from "./CompleteAppointmentDialog";

export type ManagedAppointment = {
  id: number;
  patient: string;
  dentist: string;
  dateTime: string;
  durationMin: number;
  motivo: string | null;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  observaciones: string | null;
  receta: string | null;
  recomendaciones: string | null;
};
export type PersonOption = { id: number; name: string };

type ManageData = {
  appointments: ManagedAppointment[];
  patients: PersonOption[];
  dentists: PersonOption[];
};

type Feedback = { variant: "success" | "info" | "error"; title: string; message?: string };

const STAFF: UserRole[] = ["administrador", "recepcionista", "odontologo"];

const statusMeta: Record<ManagedAppointment["estado"], { label: string; variant: "success" | "info" | "error" }> = {
  pendiente: { label: "Pendiente", variant: "info" },
  confirmada: { label: "Confirmada", variant: "success" },
  completada: { label: "Completada", variant: "success" },
  cancelada: { label: "Cancelada", variant: "error" },
};

type AppointmentAction = "confirm" | "complete" | "cancel" | "delete";

function AppointmentActionMenu({ appointment, canDelete, disabled, onAction }: { appointment: ManagedAppointment; canDelete: boolean; disabled: boolean; onAction: (action: AppointmentAction) => void }) {
  if ((appointment.estado === "completada" || appointment.estado === "cancelada") && !canDelete) return null;
  const items = [
    ...(appointment.estado === "pendiente" ? [{ label: "Confirmar", onSelect: () => onAction("confirm" as const) }] : []),
    ...(appointment.estado === "confirmada" ? [{ label: "Completar", onSelect: () => onAction("complete" as const) }] : []),
    ...(appointment.estado === "pendiente" || appointment.estado === "confirmada" ? [{ label: "Cancelar", onSelect: () => onAction("cancel" as const), destructive: true }] : []),
    ...(canDelete ? [{ label: "Eliminar", onSelect: () => onAction("delete" as const), destructive: true }] : []),
  ];
  return <ActionMenu label={`Acciones para la cita de ${appointment.patient}`} disabled={disabled} items={items} />;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentsManager({ role }: { role: UserRole }) {
  const [data, setData] = useState<ManageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [completionId, setCompletionId] = useState<number | null>(null);

  const canManage = STAFF.includes(role);
  const canDelete = role === "administrador";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/appointments/manage", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Error al cargar las citas.");
      setData(payload.data);
    } catch (error) {
      setFeedback({ variant: "error", title: "Error de datos", message: error instanceof Error ? error.message : undefined });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = useCallback(
    async (id: number, estado: ManagedAppointment["estado"], completion?: { diagnostico: string; tratamiento: string; observaciones: string; receta: string; recomendaciones: string }) => {
      setBusyId(id);
      setFeedback(null);
      try {
        const response = await fetch(`/api/v1/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado, ...completion }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo actualizar la cita.");
        if (payload.data?.notified) {
          setFeedback({ variant: "info", title: "Lista de espera notificada", message: `Se notificó a ${payload.data.notified} sobre el espacio liberado.` });
        } else {
          setFeedback({ variant: "success", title: "Cita actualizada" });
        }
        await load();
      } catch (error) {
        setFeedback({ variant: "error", title: "No se pudo actualizar", message: error instanceof Error ? error.message : undefined });
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const remove = useCallback(
    async (id: number) => {
      setBusyId(id);
      setFeedback(null);
      try {
        const response = await fetch(`/api/v1/appointments/${id}`, { method: "DELETE" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo eliminar la cita.");
        setFeedback({ variant: "success", title: "Cita eliminada" });
        await load();
      } catch (error) {
        setFeedback({ variant: "error", title: "No se pudo eliminar", message: error instanceof Error ? error.message : undefined });
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const columns: DataTableColumn<ManagedAppointment>[] = [
    { id: "dateTime", header: "Fecha y hora", accessor: "dateTime", sortable: true, cell: (value) => formatDateTime(String(value)) },
    { id: "patient", header: "Paciente", accessor: "patient", sortable: true },
    { id: "dentist", header: "Odontólogo", accessor: "dentist", sortable: true },
    { id: "motivo", header: "Motivo", accessor: "motivo", cell: (value) => (value ? String(value) : "Consulta") },
    { id: "durationMin", header: "Duración", accessor: "durationMin", cell: (value) => `${value} min` },
    {
      id: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      cell: (_value, row) => <Badge variant={statusMeta[row.estado].variant}>{statusMeta[row.estado].label}</Badge>,
    },
  ];

  if (canManage) {
    columns.push({
      id: "acciones",
      header: "Acciones",
      accessor: "id",
      sortable: false,
      cell: (_value, row) => {
        const busy = busyId === row.id;
        return (
          <div className="flex flex-wrap gap-2">
            <AppointmentActionMenu appointment={row} canDelete={canDelete} disabled={busy} onAction={(action) => { if (action === "confirm") void changeStatus(row.id, "confirmada"); if (action === "complete") setCompletionId(row.id); if (action === "cancel") void changeStatus(row.id, "cancelada"); if (action === "delete") void remove(row.id); }} />
          </div>
        );
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Citas y agenda</h1>
          <p className="mt-2 text-sm text-slate-600">Gestión de la agenda de la clínica</p>
        </div>
        {canManage && data && (
          <NewAppointmentDialog
            patients={data.patients}
            dentists={data.dentists}
            onCreated={(message) => {
              setFeedback({ variant: "success", title: "Cita registrada", message });
              load();
            }}
            trigger={
              <Button>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Nueva cita
              </Button>
            }
          />
        )}
      </div>
      {feedback && <ToastAlert variant={feedback.variant} title={feedback.title} message={feedback.message} onClose={() => setFeedback(null)} />}
      {completionId !== null && (
        <CompleteAppointmentDialog
          open
          pending={busyId === completionId}
          appointment={data?.appointments.find((appointment) => appointment.id === completionId) ?? null}
          onOpenChange={(open) => { if (!open && busyId !== completionId) setCompletionId(null); }}
          onSubmit={async (completion) => {
            await changeStatus(completionId, "completada", completion);
            if (busyId !== completionId) setCompletionId(null);
          }}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Agenda de citas</CardTitle>
          <CardDescription>Próximas citas y registro de nuevas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <p className="p-6 text-center text-sm text-slate-600" role="status">
              Cargando citas...
            </p>
          ) : (
            <DataTable
          columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
          data={(data?.appointments ?? []) as unknown as Record<string, unknown>[]}
          getRowId={(row) => String((row as ManagedAppointment).id)}
          caption="Citas próximas"
          searchKeys={["patient", "dentist"]}
          searchPlaceholder="Buscar paciente u odontólogo..."
          rowLabel="citas"
          filters={[
            {
              id: "estado",
              label: "Estado",
              accessor: "estado",
              options: [
                { label: "Pendiente", value: "pendiente" },
                { label: "Confirmada", value: "confirmada" },
                { label: "Completada", value: "completada" },
                { label: "Cancelada", value: "cancelada" },
              ],
            },
          ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
