"use client";

import { useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Button } from "@/frontend/components/ui/button";
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
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";

type PersonOption = { id: number; name: string };

type Props = {
  patients: PersonOption[];
  dentists: PersonOption[];
  trigger: ReactNode;
  onCreated: (message: string) => void;
};

const DURATIONS = ["30", "45", "60"];

export function NewAppointmentDialog({ patients, dentists, trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [idPaciente, setIdPaciente] = useState("");
  const [idOdontologo, setIdOdontologo] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setIdPaciente("");
    setIdOdontologo("");
    setDuracion("30");
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPaciente,
          idOdontologo,
          fechaHora: String(form.get("fechaHora") ?? ""),
          duracionMin: duracion,
          motivo: String(form.get("motivo") ?? ""),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo registrar la cita.");
      const dentist = dentists.find((option) => String(option.id) === idOdontologo)?.name ?? "";
      setOpen(false);
      reset();
      onCreated(`Cita registrada con ${dentist}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo registrar la cita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>Registrá una cita para un paciente con un odontólogo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="paciente-trigger">Paciente</Label>
            <Select value={idPaciente} onValueChange={setIdPaciente}>
              <SelectTrigger id="paciente-trigger" aria-label="Paciente">
                <SelectValue placeholder="Seleccioná un paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="odontologo-trigger">Odontólogo</Label>
            <Select value={idOdontologo} onValueChange={setIdOdontologo}>
              <SelectTrigger id="odontologo-trigger" aria-label="Odontólogo">
                <SelectValue placeholder="Seleccioná un odontólogo" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fechaHora">Fecha y hora</Label>
              <Input id="fechaHora" name="fechaHora" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion-trigger">Duración</Label>
              <Select value={duracion} onValueChange={setDuracion}>
                <SelectTrigger id="duracion-trigger" aria-label="Duración">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Input id="motivo" name="motivo" maxLength={150} placeholder="Consulta, limpieza, control..." />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !idPaciente || !idOdontologo}>
              {pending ? "Guardando..." : "Registrar cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
