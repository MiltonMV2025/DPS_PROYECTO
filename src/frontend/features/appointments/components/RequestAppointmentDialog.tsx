"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";
import { Button } from "@/frontend/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";

type Availability = { dentists: Array<{ id: number; name: string; slots: Array<{ start: string; end: string }> }> };

export function RequestAppointmentDialog({ trigger, onCreated }: { trigger: ReactNode; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("30");
  const [dentist, setDentist] = useState("");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDentist = availability?.dentists.find((item) => String(item.id) === dentist);

  useEffect(() => {
    if (!open || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setAvailability(null);
      setDentist("");
      setSlot("");
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    setError(null);
    fetch(`/api/v1/appointments/availability?date=${encodeURIComponent(date)}&duracionMin=${duration}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo consultar la disponibilidad.");
        return payload.data as Availability;
      })
      .then((value) => { if (!cancelled) setAvailability(value); })
      .catch((caught) => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo consultar la disponibilidad."); })
      .finally(() => { if (!cancelled) setLoadingAvailability(false); });
    return () => { cancelled = true; };
  }, [date, duration, open]);

  function reset() {
    setDate(""); setDuration("30"); setDentist(""); setSlot(""); setReason(""); setAvailability(null); setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dentist || !slot) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/me/appointment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idOdontologo: dentist, fechaHora: slot, duracionMin: duration, motivo: reason }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo enviar la solicitud.");
      setOpen(false);
      reset();
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo enviar la solicitud.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar cita</DialogTitle>
          <DialogDescription>Elegí una fecha y horario disponible. La clínica confirmará tu solicitud.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && <Alert variant="error"><AlertTitle>No se pudo completar la solicitud</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="request-date">Fecha</Label><Input id="request-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="request-duration">Duración</Label><Select value={duration} onValueChange={(value) => { setDuration(value); setDentist(""); setSlot(""); }}><SelectTrigger id="request-duration" aria-label="Duración"><SelectValue /></SelectTrigger><SelectContent>{["30", "45", "60"].map((value) => <SelectItem key={value} value={value}>{value} minutos</SelectItem>)}</SelectContent></Select></div>
          </div>
          {loadingAvailability && <p className="text-sm text-slate-600" role="status">Consultando horarios disponibles...</p>}
          {availability && !loadingAvailability && <>
            <div className="space-y-2"><Label htmlFor="request-dentist">Odontólogo</Label><Select value={dentist} onValueChange={(value) => { setDentist(value); setSlot(""); }}><SelectTrigger id="request-dentist" aria-label="Odontólogo"><SelectValue placeholder="Seleccioná un odontólogo" /></SelectTrigger><SelectContent>{availability.dentists.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            {selectedDentist && <div className="space-y-2"><Label>Horarios</Label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{selectedDentist.slots.map((item) => <Button key={item.start} type="button" variant={slot === item.start ? "default" : "outline"} onClick={() => setSlot(item.start)}>{item.start.slice(11, 16)} - {item.end.slice(11, 16)}</Button>)}</div></div>}
            {!availability.dentists.length && <p className="text-sm text-slate-600">No hay horarios disponibles para esa fecha.</p>}
          </>}
          <div className="space-y-2"><Label htmlFor="request-reason">Motivo (opcional)</Label><Input id="request-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={150} placeholder="Consulta, limpieza, control..." /></div>
          <DialogFooter><DialogClose asChild><Button variant="outline" type="button">Cancelar</Button></DialogClose><Button type="submit" disabled={pending || !date || !dentist || !slot}>{pending ? "Enviando..." : "Enviar solicitud"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
