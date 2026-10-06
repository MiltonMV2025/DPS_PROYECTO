"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Button } from "@/frontend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/frontend/components/ui/dialog";
import { Label } from "@/frontend/components/ui/label";

type Appointment = { patient: string; dentist: string };
type Completion = { diagnostico: string; tratamiento: string; observaciones: string; receta: string; recomendaciones: string };
const textareaClass = "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
type Props = { open: boolean; pending: boolean; appointment: Appointment | null; onOpenChange: (open: boolean) => void; onSubmit: (completion: Completion) => Promise<void> };

export function CompleteAppointmentDialog({ open, pending, appointment, onOpenChange, onSubmit }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [includePrescription, setIncludePrescription] = useState(false);
  const [includeRecommendations, setIncludeRecommendations] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const completion = { diagnostico: String(form.get("diagnostico") ?? "").trim(), tratamiento: String(form.get("tratamiento") ?? "").trim(), observaciones: String(form.get("observaciones") ?? "").trim(), receta: String(form.get("receta") ?? "").trim(), recomendaciones: String(form.get("recomendaciones") ?? "").trim() };
    if (!completion.diagnostico) { setError("Completá el diagnóstico."); return; }
    if (!completion.tratamiento) { setError("Completá el tratamiento realizado."); return; }
    if (!completion.observaciones) { setError("Completá las observaciones."); return; }
    try { await onSubmit(completion); } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo completar la cita."); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Completar cita</DialogTitle><DialogDescription>{appointment ? `${appointment.patient} · ${appointment.dentist}` : "Registrá el resultado de la atención."}</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="diagnostico">Diagnóstico <span className="text-red-600">*</span></Label><textarea id="diagnostico" name="diagnostico" required maxLength={5000} rows={2} placeholder="Ej.: Caries oclusal en pieza 36" className={textareaClass} /></div>
          <div className="space-y-2"><Label htmlFor="tratamiento">Tratamiento realizado <span className="text-red-600">*</span></Label><textarea id="tratamiento" name="tratamiento" required maxLength={5000} rows={2} placeholder="Ej.: Obturación con resina compuesta" className={textareaClass} /></div>
          <div className="space-y-2"><Label htmlFor="observaciones">Observaciones <span className="text-red-600">*</span></Label><textarea id="observaciones" name="observaciones" required maxLength={5000} rows={3} className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={includePrescription} onChange={(event) => setIncludePrescription(event.target.checked)} />Agregar receta</label>
          {includePrescription && <div className="space-y-2"><Label htmlFor="receta">Receta</Label><textarea id="receta" name="receta" maxLength={5000} rows={3} className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>}
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={includeRecommendations} onChange={(event) => setIncludeRecommendations(event.target.checked)} />Agregar recomendaciones</label>
          {includeRecommendations && <div className="space-y-2"><Label htmlFor="recomendaciones">Recomendaciones</Label><textarea id="recomendaciones" name="recomendaciones" maxLength={5000} rows={3} className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring" /></div>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Completar cita"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
