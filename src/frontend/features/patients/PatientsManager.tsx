"use client";

import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { ActionMenu } from "@/frontend/components/common/ActionMenu";
import { ToastAlert } from "@/frontend/components/common/ToastAlert";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { DateField } from "@/frontend/components/ui/date-field";
import type { PatientListItem } from "@/backend/modules/read-models";

type FormState = Omit<PatientListItem, "id" | "active">;
const emptyForm: FormState = { name: "", email: "", phone: "", birthDate: "", allergies: "" };

function formatDateOnly(value: string): string {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es-SV", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/El_Salvador" });
}

function toDateInputValue(value: string): string {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/El_Salvador", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(parsed);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

function PatientActionMenu({ patient, disabled, onEdit, onDelete }: { patient: PatientListItem; disabled: boolean; onEdit: () => void; onDelete: () => void }) {
  return <ActionMenu label={`Más acciones para ${patient.name}`} disabled={disabled} items={[{ label: "Editar", onSelect: onEdit }, { label: "Eliminar", onSelect: onDelete, destructive: true }]} />;
}

function PatientForm({ value, pending, editing, onChange, onSubmit, onCancel }: { value: FormState; pending: boolean; editing: boolean; onChange: (value: FormState) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="patient-name">Nombre</Label><Input id="patient-name" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} maxLength={120} required /></div>
      <div className="space-y-2"><Label htmlFor="patient-email">Correo</Label><Input id="patient-email" type="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} maxLength={150} required /></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="patient-phone">Teléfono</Label><Input id="patient-phone" inputMode="numeric" autoComplete="tel" placeholder="7455-6612" value={value.phone} onChange={(event) => onChange({ ...value, phone: formatPhone(event.target.value) })} maxLength={9} pattern="[0-9]{4}-?[0-9]{4}" required /></div>
      <div className="space-y-2"><Label htmlFor="patient-birth-date">Fecha de nacimiento</Label><DateField id="patient-birth-date" autoComplete="bday" value={value.birthDate} onChange={(event) => onChange({ ...value, birthDate: event.target.value })} required /></div>
    </div>
    <div className="space-y-2"><Label htmlFor="patient-allergies">Alergias</Label><textarea id="patient-allergies" className="flex min-h-24 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value.allergies ?? ""} onChange={(event) => onChange({ ...value, allergies: event.target.value })} maxLength={2000} /></div>
    <DialogFooter><Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Guardando..." : editing ? "Guardar cambios" : "Crear paciente"}</Button></DialogFooter>
  </form>;
}

export function PatientsManager({ patients, error }: { patients: PatientListItem[]; error?: string }) {
  const [items, setItems] = useState(patients);
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<PatientListItem | null>(null);
  const [deleting, setDeleting] = useState<PatientListItem | null>(null);
  const [editing, setEditing] = useState<PatientListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: "success" | "info" | "error"; title: string; message?: string } | null>(null);

  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(item: PatientListItem) { setEditing(item); setForm({ name: item.name, email: item.email, phone: formatPhone(item.phone), birthDate: toDateInputValue(item.birthDate), allergies: item.allergies ?? "" }); setFormOpen(true); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    try {
      const response = await fetch("/api/v1/patients", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing?.id, nombre: form.name, correo: form.email, telefono: form.phone, fecha_nacimiento: form.birthDate, alergias: form.allergies || null }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo guardar el paciente.");
      const saved: PatientListItem = { id: editing?.id ?? payload.data.id, name: form.name, email: form.email, phone: formatPhone(form.phone), birthDate: form.birthDate, allergies: form.allergies || null, active: true };
      setItems((current) => editing ? current.map((item) => item.id === saved.id ? { ...item, ...saved, active: editing.active } : item) : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setFormOpen(false); setFeedback({ variant: "success", title: editing ? "Paciente actualizado" : "Paciente creado", message: payload.data.temporaryPassword ? `Contraseña temporal: ${payload.data.temporaryPassword}` : undefined });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo guardar", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  async function remove() {
    if (!deleting) return; setPending(true);
    try {
      const response = await fetch("/api/v1/patients", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo eliminar el paciente.");
      setItems((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); setFeedback({ variant: "success", title: "Paciente eliminado" });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo eliminar", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  const columns = useMemo<DataTableColumn<PatientListItem>[]>(() => [
    { id: "name", header: "Nombre", accessor: "name", sortable: true },
    { id: "email", header: "Correo", accessor: "email", sortable: true },
    { id: "phone", header: "Teléfono", accessor: "phone", cell: (value) => formatPhone(String(value)) },
    { id: "birthDate", header: "Nacimiento", accessor: "birthDate", cell: (value) => formatDateOnly(String(value)) },
    { id: "status", header: "Estado", accessor: "active", cell: (value) => <Badge variant={value ? "success" : "error"}>{value ? "Activo" : "Inactivo"}</Badge> },
    { id: "actions", header: "Acciones", accessor: "id", cell: (_value, row) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={`Ver paciente ${row.name}`} onClick={() => setDetail(row)}><Eye className="h-4 w-4" /></Button><PatientActionMenu patient={row} disabled={pending} onEdit={() => openEdit(row)} onDelete={() => setDeleting(row)} /></div> },
  ], [pending]);

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold">Pacientes</h1><p className="mt-2 text-sm text-slate-600">Gestión de pacientes de la clínica</p></div><Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo paciente</Button></div>
    {error && <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert>}
    <Card><CardHeader><CardTitle>Pacientes</CardTitle></CardHeader><CardContent><DataTable columns={columns} data={items} caption="Listado de pacientes" rowLabel="pacientes" searchKeys={["name", "email"]} getRowId={(row) => String(row.id)} /></CardContent></Card>
    {feedback && <ToastAlert {...feedback} onClose={() => setFeedback(null)} />}
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar paciente" : "Nuevo paciente"}</DialogTitle><DialogDescription>{editing ? "Actualizá los datos del paciente." : "Creá el usuario y la ficha del paciente."}</DialogDescription></DialogHeader><PatientForm value={form} pending={pending} editing={Boolean(editing)} onChange={setForm} onSubmit={save} onCancel={() => setFormOpen(false)} /></DialogContent></Dialog>
    <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}><DialogContent><DialogHeader><DialogTitle>Detalle de paciente</DialogTitle><DialogDescription>Información registrada del paciente.</DialogDescription></DialogHeader>{detail && <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm"><dt className="text-slate-600">Nombre</dt><dd>{detail.name}</dd><dt className="text-slate-600">Correo</dt><dd>{detail.email}</dd><dt className="text-slate-600">Teléfono</dt><dd>{formatPhone(detail.phone)}</dd><dt className="text-slate-600">Nacimiento</dt><dd>{formatDateOnly(detail.birthDate)}</dd><dt className="text-slate-600">Alergias</dt><dd>{detail.allergies || "No registradas"}</dd><dt className="text-slate-600">Estado</dt><dd><Badge variant={detail.active ? "success" : "error"}>{detail.active ? "Activo" : "Inactivo"}</Badge></dd></dl>}<DialogFooter><DialogClose asChild><Button>Cerrar</Button></DialogClose></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Eliminar paciente</DialogTitle><DialogDescription>Vas a eliminar a {deleting?.name}. Se eliminará toda la información relacionada, incluidas sus citas, historiales clínicos, facturas y notificaciones. Esta acción no se puede deshacer.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline" disabled={pending}>Cancelar</Button></DialogClose><Button variant="default" onClick={remove} disabled={pending}>{pending ? "Eliminando..." : "Confirmar eliminación"}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
