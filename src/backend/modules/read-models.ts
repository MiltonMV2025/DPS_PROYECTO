import type { Paginated } from "@/shared/types";

export type AppointmentListItem = { id: number; dateTime: string; patient: string; dentist: string; service: string; status: string; durationMin: number };
export type PatientListItem = { id: number; name: string; email: string; phone: string; birthDate: string; allergies: string | null };
export type InventoryListItem = { id: number; name: string; category: string; unit: string; currentStock: number; minimumStock: number; supplierId: number | null; supplier: string | null; stockStatus: "ok" | "low" };
export type SupplierListItem = { id: number; businessName: string; category: string; contact: string | null; phone: string | null; email: string | null; lastPurchase: string | null; status: string };
export type ClinicalRecordListItem = { id: number; appointmentId: number; patient: string; diagnosis: string; treatment: string; observations: string | null; createdAt: string };
export type UserListItem = { id: number; name: string; email: string; role: string; active: boolean; lastAccess: string | null };
export type StatusBreakdownItem = { estado: string; total: number };
export type DashboardMetrics = { appointmentsToday: number; activePatients: number; monthlyRevenue: number; suppliesToRestock: number; occupancy: number; confirmationRate: number; monthlyGoal: number; statusBreakdown: StatusBreakdownItem[] };
export type ListResult<T> = Paginated<T>;
