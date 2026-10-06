"use client";

import { useMemo, useState } from "react";
import { ActionMenu } from "@/frontend/components/common/ActionMenu";
import { MultiSelect } from "@/frontend/components/ui/multi-select";
import { ToastAlert } from "@/frontend/components/common/ToastAlert";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import type { SupplierListItem } from "@/backend/modules/read-models";

type FormState = { businessName: string; category: string; contact: string; phone: string; email: string };
const emptyForm: FormState = { businessName: "", category: "", contact: "", phone: "", email: "" };
const statusMeta: Record<string, { label: string; variant: "success" | "info" | "error" }> = { activo: { label: "Activo", variant: "success" }, evaluacion: { label: "En evaluación", variant: "info" }, inactivo: { label: "Suspendido", variant: "error" } };

function formatPhone(value: string): string { const digits = value.replace(/\D/g, "").slice(0, 8); return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits; }

export function SuppliersManager({ suppliers, error, canManage }: { suppliers: SupplierListItem[]; error?: string; canManage: boolean }) {
  const [items, setItems] = useState(suppliers);
  const [categories, setCategories] = useState(() => [...new Set(suppliers.map((item) => item.category))].sort());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierListItem | null>(null);
  const [suspending, setSuspending] = useState<SupplierListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: "success" | "info" | "error"; title: string; message?: string } | null>(null);

  async function filterCategories(next: string[]) {
    setSelectedCategories(next);
    try {
      const query = next.map((category) => `category=${encodeURIComponent(category)}`).join("&");
      const response = await fetch(query ? `/api/v1/suppliers?${query}` : "/api/v1/suppliers", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudieron filtrar los proveedores.");
      setItems(payload.data?.items ?? []);
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo aplicar el filtro", message: caught instanceof Error ? caught.message : undefined }); }
  }

  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(item: SupplierListItem) { setEditing(item); setForm({ businessName: item.businessName, category: item.category, contact: item.contact ?? "", phone: item.phone ?? "", email: item.email ?? "" }); setFormOpen(true); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    try {
      const response = await fetch("/api/v1/suppliers", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(editing ? { id: editing.id } : {}), razon_social: form.businessName, categoria: form.category, contacto: form.contact || null, telefono: form.phone ? formatPhone(form.phone) : null, correo: form.email || null }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo guardar el proveedor.");
      const saved: SupplierListItem = { id: editing?.id ?? payload.data.id, businessName: form.businessName, category: form.category, contact: form.contact || null, phone: form.phone ? formatPhone(form.phone) : null, email: form.email || null, lastPurchase: editing?.lastPurchase ?? null, status: editing?.status ?? "activo" };
      setItems((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved].sort((a, b) => a.businessName.localeCompare(b.businessName)));
      setCategories((current) => [...new Set([...current, saved.category])].sort()); setFormOpen(false); setFeedback({ variant: "success", title: editing ? "Proveedor actualizado" : "Proveedor creado" });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo guardar", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  async function suspend() {
    if (!suspending) return; setPending(true);
    try {
      const response = await fetch("/api/v1/suppliers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: suspending.id }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo suspender el proveedor.");
      setItems((current) => current.map((item) => item.id === suspending.id ? { ...item, status: "inactivo" } : item)); setSuspending(null); setFeedback({ variant: "success", title: "Proveedor suspendido", message: "No podrá reactivarse." });
    } catch (caught) { setFeedback({ variant: "error", title: "No se pudo suspender", message: caught instanceof Error ? caught.message : undefined }); }
    finally { setPending(false); }
  }

  const columns = useMemo<DataTableColumn<SupplierListItem>[]>(() => {
    const baseColumns: DataTableColumn<SupplierListItem>[] = [
    { id: "businessName", header: "Razón social", accessor: "businessName", sortable: true },
    { id: "category", header: "Categoría", accessor: "category", sortable: true },
    { id: "contact", header: "Contacto", accessor: "contact", cell: (value) => String(value ?? "Sin contacto") },
    { id: "phone", header: "Teléfono", accessor: "phone", cell: (value) => value ? formatPhone(String(value)) : "Sin teléfono" },
    { id: "status", header: "Estado", accessor: "status", sortable: true, cell: (value) => { const status = statusMeta[String(value)] ?? statusMeta.inactivo; return <Badge variant={status.variant}>{status.label}</Badge>; } },
    ];
    if (canManage) baseColumns.push({ id: "actions", header: "Acciones", accessor: "id", cell: (_value, row) => <ActionMenu label={`Acciones para ${row.businessName}`} disabled={pending} items={[{ label: "Editar", onSelect: () => openEdit(row) }, ...(row.status !== "inactivo" ? [{ label: "Suspender", onSelect: () => setSuspending(row), destructive: true }] : [])]} /> });
    return baseColumns;
  }, [canManage, pending]);

  return <section className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold">Proveedores</h1><p className="mt-2 text-sm text-slate-600">Gestión de proveedores de la clínica</p></div>{canManage && <Button onClick={openCreate}>+ Nuevo proveedor</Button>}</div>{error && <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert>}<Card><CardHeader><CardTitle>Proveedores</CardTitle></CardHeader><CardContent><DataTable columns={columns} data={items} caption="Listado de proveedores" rowLabel="proveedores" searchKeys={["businessName", "category"]} getRowId={(row) => String(row.id)} toolbarContent={<MultiSelect label="Categorías" options={categories.map((category) => ({ value: category, label: category }))} value={selectedCategories} onChange={filterCategories} />} additionalFilterActive={selectedCategories.length > 0} onClearAdditionalFilters={() => void filterCategories([])} /></CardContent></Card>{feedback && <ToastAlert {...feedback} onClose={() => setFeedback(null)} />}
    {canManage && <><Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle><DialogDescription>{editing ? "Actualizá los datos del proveedor." : "Registrá un nuevo proveedor."}</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><div className="space-y-2"><Label htmlFor="supplier-business-name">Razón social</Label><Input id="supplier-business-name" value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} maxLength={150} required /></div><div className="space-y-2"><Label htmlFor="supplier-category">Categoría</Label><Input id="supplier-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} maxLength={80} required /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="supplier-contact">Contacto</Label><Input id="supplier-contact" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} maxLength={120} /></div><div className="space-y-2"><Label htmlFor="supplier-phone">Teléfono</Label><Input id="supplier-phone" inputMode="numeric" placeholder="2245-7788" value={form.phone} onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })} maxLength={9} /></div></div><div className="space-y-2"><Label htmlFor="supplier-email">Correo</Label><Input id="supplier-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={150} /></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline" disabled={pending}>Cancelar</Button></DialogClose><Button type="submit" disabled={pending}>{pending ? "Guardando..." : editing ? "Guardar cambios" : "Crear proveedor"}</Button></DialogFooter></form></DialogContent></Dialog><Dialog open={Boolean(suspending)} onOpenChange={(open) => { if (!open) setSuspending(null); }}><DialogContent><DialogHeader><DialogTitle>Suspender proveedor</DialogTitle><DialogDescription>¿Deseás suspender a {suspending?.businessName}? Quedará inactivo y no podrá reactivarse posteriormente.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline" disabled={pending}>Cancelar</Button></DialogClose><Button onClick={suspend} disabled={pending}>{pending ? "Suspendiendo..." : "Confirmar suspensión"}</Button></DialogFooter></DialogContent></Dialog></>}
  </section>;
}
