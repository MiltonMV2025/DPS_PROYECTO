export type PatientProfile = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  allergies: string | null;
  records: PatientClinicalRecord[];
};

export type PatientClinicalRecord = { id: number; appointmentDate: string; dentist: string; reason: string | null; durationMin: number; appointmentStatus: string; diagnosis: string; treatment: string; observations: string | null; prescription: string | null; recommendations: string | null; createdAt: string };
