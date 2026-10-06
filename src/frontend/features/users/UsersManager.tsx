"use client";

import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";
import type { UserListItem } from "@/backend/modules/read-models";

type FormState = { name: string; email: string; role: string; password: string };
const emptyForm: FormState = { name: "", email: "", role: "paciente", password: "" };
const roleLabels: Record<string, string> = { administrador: "Administrador", odontologo: "Odontólogo", recepcionista: "Recepcionista", paciente: "Paciente" };

function formatLastAccess(value: string | null): string {
  if (!value) return "Nunca";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" });
}

export function UsersManager({ users, error }: { users: UserListItem[]; error?: string }) {
  const [items, setItems] = useState(users);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [suspending, setSuspending] = useState<UserListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: "success" | "info" | "error"; title: string; message?: string } | null>(null);

  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(item: UserListItem) { setEditing(item); setForm({ name: item.name, email: item.email, role: item.role, password: "" }); setFormOpen(true); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    try {
      const response = await fetch("/api/v1/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(editing ? { id: editing.id } : {}), nombre: form.name, correo: form.email, rol: form.role, password: form.password }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo guardar el usuario.");
      const saved: UserListItem = { id: editing?.id ?? payload.data.id, name: form.name, email: form.email, role: form.role, active: editing?.active ?? true, lastAccess: editing?.lastAccess ?? null };
      setItems((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setFormOpen(false); setFeedback({ variant: "success", title: editing ? "Usuario actualizado" : "Usuario creado" });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo guardar", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  async function suspend() {
    if (!suspending) return; setPending(true);
    try {
      const response = await fetch("/api/v1/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: suspending.id }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo suspender el usuario.");
      setItems((current) => current.map((item) => item.id === suspending.id ? { ...item, active: false } : item)); setSuspending(null); setFeedback({ variant: "success", title: "Usuario suspendido", message: "Esta cuenta no podrá reactivarse." });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo suspender", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  const columns = useMemo<DataTableColumn<UserListItem>[]>(() => [
    { id: "name", header: "Nombre", accessor: "name", sortable: true },
    { id: "email", header: "Correo", accessor: "email", sortable: true },
    { id: "role", header: "Rol", accessor: "role", sortable: true, cell: (value) => <Badge variant="info">{roleLabels[String(value)] ?? String(value)}</Badge> },
    { id: "active", header: "Estado", accessor: "active", sortable: true, cell: (value) => <Badge variant={value ? "success" : "error"}>{value ? "Activo" : "Suspendido"}</Badge> },
    { id: "lastAccess", header: "Último acceso", accessor: "lastAccess", cell: (value) => formatLastAccess(value as string | null) },
    { id: "actions", header: "Acciones", accessor: "id", cell: (_value, row) => <ActionMenu label={`Acciones para ${row.name}`} disabled={pending} items={[{ label: "Editar", onSelect: () => openEdit(row) }, ...(row.active ? [{ label: "Suspender", onSelect: () => setSuspending(row), destructive: true }] : [])]} /> },
  ], [pending]);

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold">Usuarios</h1><p className="mt-2 text-sm text-slate-600">Gestión de usuarios y roles</p></div><Button onClick={openCreate}>+ Nuevo usuario</Button></div>
    {error && <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert>}
    <Card><CardHeader><CardTitle>Usuarios</CardTitle></CardHeader><CardContent><DataTable columns={columns} data={items} caption="Listado de usuarios" rowLabel="usuarios" searchKeys={["name", "email", "role"]} filters={[{ id: "role", label: "Rol", accessor: "role", options: Object.entries(roleLabels).map(([value, label]) => ({ value, label })) }, { id: "active", label: "Estado", accessor: "active", options: [{ value: "true", label: "Activos" }, { value: "false", label: "Suspendidos" }] }]} getRowId={(row) => String(row.id)} /></CardContent></Card>
    {feedback && <ToastAlert {...feedback} onClose={() => setFeedback(null)} />}
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle><DialogDescription>{editing ? "Actualizá los datos del usuario. La contraseña es opcional." : "Creá un usuario y definí su contraseña."}</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><div className="space-y-2"><Label htmlFor="user-name">Nombre</Label><Input id="user-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} required /></div><div className="space-y-2"><Label htmlFor="user-email">Correo</Label><Input id="user-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={150} required /></div><div className="space-y-2"><Label htmlFor="user-role">Rol</Label><Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}><SelectTrigger id="user-role"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(roleLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="user-password">Contraseña{editing ? " nueva" : ""}</Label><Input id="user-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} maxLength={72} required={!editing} placeholder={editing ? "Dejar vacía para conservarla" : "Mínimo 8 caracteres"} /></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline" disabled={pending}>Cancelar</Button></DialogClose><Button type="submit" disabled={pending}>{pending ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(suspending)} onOpenChange={(open) => { if (!open) setSuspending(null); }}><DialogContent><DialogHeader><DialogTitle>Suspender usuario</DialogTitle><DialogDescription>¿Deseás suspender a {suspending?.name}? La cuenta perderá el acceso y no podrá reactivarse posteriormente.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline" disabled={pending}>Cancelar</Button></DialogClose><Button onClick={suspend} disabled={pending}>{pending ? "Suspendiendo..." : "Confirmar suspensión"}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
