import { api } from "./client";
import type { Appointment, Availability, Dentist } from "@/types/api";

export async function listAppointments() {
  const response = await api.get<{ data: Appointment[] }>("/api/v1/me/appointments");
  return response.data.data;
}

export async function listDentists() {
  const response = await api.get<{ data: Dentist[] }>("/api/v1/appointments/dentists");
  return response.data.data;
}

export async function getAvailability(params: { date: string; duracionMin: number; idOdontologo: number }) {
  const response = await api.get<{ data: Availability }>("/api/v1/appointments/availability", { params });
  return response.data.data;
}

export async function createAppointment(input: { idOdontologo: number; fechaHora: string; duracionMin: number; motivo?: string }) {
  const response = await api.post<{ data: { id: number; status: "pendiente" } }>("/api/v1/me/appointment-requests", input);
  return response.data.data;
}

export async function cancelAppointment(id: number) {
  await api.patch(`/api/v1/me/appointments/${id}/cancel`);
}
