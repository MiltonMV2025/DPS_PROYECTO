import { UserRound, Phone, Cake, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { createPatientProfileController } from "@/backend/modules/patient-profile/profile.controller";
import { requireModule } from "@/frontend/lib/session";
import { ClinicalRecordsTable } from "@/frontend/features/patient-profile/components/ClinicalRecordsTable";
import { ExportPdfButton } from "@/frontend/components/common/ExportPdfButton";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const user = await requireModule("mi-perfil");
  const profile = await createPatientProfileController().get(user.id);
  const formatDate = (value: string) => new Date(value).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" });
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Área del paciente</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Mi perfil</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Consultá tus datos registrados en la clínica.</p><ExportPdfButton filename="expediente-paciente" title="Expediente clínico" subtitle={profile.name} sections={[{ label: "Paciente", value: profile.name }, { label: "Correo", value: profile.email }, { label: "Teléfono", value: profile.phone }, { label: "Fecha de nacimiento", value: new Date(profile.birthDate).toLocaleDateString("es-SV") }, { label: "Alergias", value: profile.allergies ?? "No registradas" }]} table={{ headers: ["Fecha", "Médico", "Motivo", "Estado", "Diagnóstico", "Tratamiento", "Observaciones", "Receta", "Recomendaciones"], rows: profile.records.map((record) => [formatDate(record.appointmentDate), record.dentist, record.reason ?? "Consulta", record.appointmentStatus, record.diagnosis, record.treatment, record.observations ?? "-", record.prescription ?? "-", record.recommendations ?? "-"]) }} /></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Datos personales</CardTitle><CardDescription>Información de tu ficha de paciente.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" /><div><p className="text-xs text-slate-500">Nombre completo</p><p className="font-medium">{profile.name}</p></div></div>
          <div className="flex items-start gap-3"><span className="mt-0.5 text-primary" aria-hidden="true">@</span><div><p className="text-xs text-slate-500">Correo electrónico</p><p className="font-medium">{profile.email}</p></div></div>
          <div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" /><div><p className="text-xs text-slate-500">Teléfono</p><p className="font-medium">{profile.phone}</p></div></div>
          <div className="flex items-start gap-3"><Cake className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" /><div><p className="text-xs text-slate-500">Fecha de nacimiento</p><p className="font-medium">{new Date(profile.birthDate).toLocaleDateString("es-SV")}</p></div></div>
          <div className="sm:col-span-2"><p className="text-xs text-slate-500">Alergias registradas</p><p className="mt-1 font-medium">{profile.allergies || "No hay alergias registradas."}</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList aria-hidden="true" className="h-5 w-5 text-primary" />Resumen de expediente</CardTitle><CardDescription>Registros clínicos asociados a tus citas.</CardDescription></CardHeader>
        <CardContent><ClinicalRecordsTable records={profile.records} /></CardContent>
      </Card>
    </section>
  );
}
