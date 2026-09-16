"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import type { UserRole } from "@/backend/database/entities";
import { ToastAlert } from "@/frontend/components/common/ToastAlert";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { CompleteAppointmentDialog } from "./CompleteAppointmentDialog";
import { ExportPdfButton } from "@/frontend/components/common/ExportPdfButton";

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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);
  if ((appointment.estado === "completada" || appointment.estado === "cancelada") && !canDelete) return null;
  const action = (next: AppointmentAction) => { setOpen(false); onAction(next); };
  return (
    <div ref={menuRef} className="relative inline-flex">
      <Button variant="ghost" size="icon" aria-label={`Acciones para la cita de ${appointment.patient}`} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)}><MoreHorizontal aria-hidden="true" className="h-5 w-5" /></Button>
      {open && <div role="menu" className="absolute right-0 top-11 z-50 min-w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg">
        {appointment.estado === "pendiente" && <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-100" onClick={() => action("confirm")}>Confirmar</button>}
        {appointment.estado === "confirmada" && <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-100" onClick={() => action("complete")}>Completar</button>}
        {(appointment.estado === "pendiente" || appointment.estado === "confirmada") && <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-100" onClick={() => action("cancel")}>Cancelar</button>}
        {canDelete && <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-100" onClick={() => action("delete")}>Eliminar</button>}
      </div>}
    </div>
  );
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
    async (id: number, estado: ManagedAppointment["estado"], completion?: { observaciones: string; receta: string; recomendaciones: string }) => {
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
    {
      id: "exportar",
      header: "Documento",
      accessor: "id",
      sortable: false,
      cell: (_value, row) => (
        <ExportPdfButton filename={`cita-${row.id}`} title="Detalle de la cita" subtitle={row.patient} description="Este documento resume la información registrada para la cita en Sonrisa Digital. Los datos clínicos se incluyen únicamente cuando existen en el expediente del paciente." sectionTitle="Información de la cita" sections={[{ label: "No. de cita", value: String(row.id) }, { label: "Paciente", value: row.patient }, { label: "Médico tratante", value: row.dentist }, { label: "Fecha y hora", value: formatDateTime(row.dateTime) }, { label: "Motivo de consulta", value: row.motivo ?? "Consulta" }, { label: "Duración", value: `${row.durationMin} minutos` }, { label: "Estado", value: statusMeta[row.estado].label }, ...(row.observaciones ? [{ label: "Observaciones", value: row.observaciones }] : []), ...(row.receta ? [{ label: "Receta", value: row.receta }] : []), ...(row.recomendaciones ? [{ label: "Recomendaciones", value: row.recomendaciones }] : [])]} label="Exportar" />
      ),
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
