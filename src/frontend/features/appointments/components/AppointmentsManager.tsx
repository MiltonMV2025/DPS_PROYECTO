"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Plus, Trash2, XCircle } from "lucide-react";
import type { UserRole } from "@/backend/database/entities";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { NewAppointmentDialog } from "./NewAppointmentDialog";

export type ManagedAppointment = {
  id: number;
  patient: string;
  dentist: string;
  dateTime: string;
  durationMin: number;
  motivo: string | null;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
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
    async (id: number, estado: ManagedAppointment["estado"]) => {
      setBusyId(id);
      setFeedback(null);
      try {
        const response = await fetch(`/api/v1/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado }),
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
            {row.estado === "pendiente" && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => changeStatus(row.id, "confirmada")}>
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                Confirmar
              </Button>
            )}
            {row.estado === "confirmada" && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => changeStatus(row.id, "completada")}>
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                Completar
              </Button>
            )}
            {(row.estado === "pendiente" || row.estado === "confirmada") && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => changeStatus(row.id, "cancelada")}>
                <XCircle aria-hidden="true" className="h-4 w-4" />
                Cancelar
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" disabled={busy} aria-label={`Eliminar cita de ${row.patient}`} onClick={() => remove(row.id)}>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return (
    <div className="space-y-4">
      {canManage && data && (
        <div className="flex justify-end">
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
        </div>
      )}
      {feedback && (
        <Alert variant={feedback.variant}>
          <AlertTitle>{feedback.title}</AlertTitle>
          {feedback.message && <AlertDescription>{feedback.message}</AlertDescription>}
        </Alert>
      )}
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
    </div>
  );
}
