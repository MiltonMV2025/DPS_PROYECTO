"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { ActionMenu } from "@/frontend/components/common/ActionMenu";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";
import type { InventoryListItem, SupplierListItem } from "@/backend/modules/read-models";

type FormState = {
  id?: number;
  nombre: string;
  categoria: string;
  unidad_medida: string;
  stock_actual: string;
  stock_minimo: string;
  id_proveedor: string;
};

const emptyForm: FormState = {
  nombre: "",
  categoria: "",
  unidad_medida: "",
  stock_actual: "0",
  stock_minimo: "0",
  id_proveedor: "none",
};

function InventoryActionMenu({ item, disabled, onEdit, onDelete }: { item: InventoryListItem; disabled: boolean; onEdit: () => void; onDelete: () => void }) {
  return <ActionMenu label={`Acciones para ${item.name}`} disabled={disabled} items={[{ label: "Editar", onSelect: onEdit }, { label: "Eliminar", onSelect: onDelete, destructive: true }]} />;
}

export function InventoryManager({ items, suppliers, error }: { items: InventoryListItem[]; suppliers: SupplierListItem[]; error?: string }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InventoryListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setActionError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  function openEdit(item: InventoryListItem) {
    setForm({
      id: item.id,
      nombre: item.name,
      categoria: item.category,
      unidad_medida: item.unit,
      stock_actual: String(item.currentStock),
      stock_minimo: String(item.minimumStock),
      id_proveedor: item.supplierId == null ? "none" : String(item.supplierId),
    });
    setActionError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setActionError(null);
    try {
      const response = await fetch("/api/v1/inventory", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          nombre: form.nombre,
          categoria: form.categoria,
          unidad_medida: form.unidad_medida,
          stock_actual: Number(form.stock_actual),
          stock_minimo: Number(form.stock_minimo),
          id_proveedor: form.id_proveedor === "none" ? null : Number(form.id_proveedor),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo guardar el insumo.");
      const wasEditing = Boolean(form.id);
      setFormOpen(false);
      setForm(emptyForm);
      setSuccess(wasEditing ? "Insumo actualizado correctamente." : "Insumo agregado correctamente.");
      router.refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "No se pudo guardar el insumo.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!deleteItem) return;
    setPending(true);
    setActionError(null);
    try {
      const response = await fetch("/api/v1/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteItem.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo eliminar el insumo.");
      setDeleteItem(null);
      setSuccess("Insumo eliminado correctamente.");
      router.refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "No se pudo eliminar el insumo.");
    } finally {
      setPending(false);
    }
  }

  const columns = useMemo<DataTableColumn<InventoryListItem>[]>(() => [
    { id: "name", header: "Insumo", accessor: "name", sortable: true },
    { id: "category", header: "Categoría", accessor: "category" },
    { id: "unit", header: "Unidad", accessor: "unit" },
    { id: "currentStock", header: "Actual", accessor: "currentStock", sortable: true },
    { id: "minimumStock", header: "Mínimo", accessor: "minimumStock" },
    { id: "supplier", header: "Proveedor", accessor: "supplier", cell: (value) => String(value ?? "Sin proveedor") },
    { id: "stockStatus", header: "Estado", accessor: "stockStatus", cell: (value) => (
      <Badge variant={value === "out" ? "error" : value === "low" ? "info" : "success"}>
        {value === "out" ? "Agotado" : value === "low" ? "Stock bajo" : "Disponible"}
      </Badge>
    ) },
    {
      id: "actions",
      header: "Acciones",
      accessor: "id",
      cell: (_value, row) => (
        <InventoryActionMenu
          item={row}
          disabled={pending}
          onEdit={() => openEdit(row)}
          onDelete={() => { setActionError(null); setSuccess(null); setDeleteItem(row); }}
        />
      ),
    },
  ], [pending]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="mt-2 text-sm text-slate-600">Control de insumos y existencias</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar insumo</Button>
      </div>

      {(error || actionError) && <Alert variant="error"><AlertDescription>{actionError ?? error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle>Inventario</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={items} caption="Listado de insumos" rowLabel="insumos" searchKeys={["name", "category"]} filters={[{ id: "stockStatus", label: "Estado de stock", accessor: "stockStatus", options: [{ label: "Sin existencias", value: "out" }] }]} getRowId={(row) => String(row.id)} />
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setActionError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar insumo" : "Agregar insumo"}</DialogTitle>
            <DialogDescription>{form.id ? "Modificá la información del insumo seleccionado." : "Registrá un nuevo insumo en el inventario."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {actionError && <Alert variant="error"><AlertDescription>{actionError}</AlertDescription></Alert>}
            <div className="space-y-2"><Label htmlFor="nombre">Nombre</Label><Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={120} required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="categoria">Categoría</Label><Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} maxLength={80} required /></div>
              <div className="space-y-2"><Label htmlFor="unidad">Unidad de medida</Label><Input id="unidad" value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} maxLength={30} placeholder="unidad, caja, paquete..." required /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="stockActual">Stock actual</Label><Input id="stockActual" type="number" min="0" step="1" value={form.stock_actual} onChange={(e) => setForm({ ...form, stock_actual: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="stockMinimo">Stock mínimo</Label><Input id="stockMinimo" type="number" min="0" step="1" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} required /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select value={form.id_proveedor} onValueChange={(value) => setForm({ ...form, id_proveedor: value })}>
                <SelectTrigger id="proveedor"><SelectValue placeholder="Seleccioná un proveedor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proveedor</SelectItem>
                  {suppliers.map((supplier) => <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.businessName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={pending}>Cancelar</Button></DialogClose>
              <Button type="submit" disabled={pending}>{pending ? "Guardando..." : form.id ? "Guardar cambios" : "Agregar insumo"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteItem)} onOpenChange={(open) => { if (!open) { setDeleteItem(null); setActionError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar insumo</DialogTitle>
            <DialogDescription>¿Deseás eliminar {deleteItem?.name}? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          {actionError && <Alert variant="error"><AlertDescription>{actionError}</AlertDescription></Alert>}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={pending}>Cancelar</Button></DialogClose>
            <Button onClick={remove} disabled={pending}>{pending ? "Eliminando..." : "Eliminar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
