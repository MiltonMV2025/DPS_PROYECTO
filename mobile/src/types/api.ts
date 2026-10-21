export type UserRole = "administrador" | "odontologo" | "recepcionista" | "paciente";

export type User = { id: number; nombre: string; correo: string; rol: UserRole };
export type ApiError = { error: { code: string; message: string } };
export type Dentist = { id: number; name: string };

export type Appointment = {
  id: number;
  idPaciente: number;
  idOdontologo: number;
  patient: string;
  dentist: string;
  dateTime: string;
  durationMin: number;
  motivo: string | null;
  estado: string;
  observaciones: string | null;
  receta: string | null;
  recomendaciones: string | null;
};

export type Profile = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  allergies: string | null;
  records: ClinicalRecord[];
};

export type ClinicalRecord = {
  id: number;
  appointmentDate: string;
  dentist: string;
  reason: string | null;
  durationMin: number;
  appointmentStatus: string;
  diagnosis: string;
  treatment: string;
  observations: string | null;
  prescription: string | null;
  recommendations: string | null;
  createdAt: string;
};

export type Availability = { date: string; durationMin: number; dentists: Array<Dentist & { slots: Array<{ start: string; end: string }> }> };
