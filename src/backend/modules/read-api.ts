import type { ApiResponse, Paginated } from "@/shared/types";
import type { DashboardMetrics, AppointmentListItem, ClinicalRecordListItem, InventoryListItem, PatientListItem, SupplierListItem, UserListItem } from "./read-models";
import { createReadRepositories, type ReadRepositories } from "@/backend/database/read-repositories";

export type ReadService<T> = { list(): Promise<T[]> };
export type ReadController<T> = { list(): Promise<ApiResponse<Paginated<T>>> };

function service<T>(repository: { findAll(): Promise<T[]> }): ReadService<T> { return { list: () => repository.findAll() }; }
function controller<T>(readService: ReadService<T>): ReadController<T> { return { async list() { const items = await readService.list(); return { data: { items, page: 1, pageSize: items.length, total: items.length } }; } }; }

export function createReadApi(repositories: ReadRepositories = createReadRepositories()) {
  return {
    appointments: controller(service<AppointmentListItem>(repositories.appointments)),
    patients: controller(service<PatientListItem>(repositories.patients)),
    inventory: controller(service<InventoryListItem>(repositories.inventory)),
    suppliers: controller(service<SupplierListItem>(repositories.suppliers)),
    clinicalRecords: controller(service<ClinicalRecordListItem>(repositories.clinicalRecords)),
    users: controller(service<UserListItem>(repositories.users)),
    dashboard: { async get(): Promise<ApiResponse<DashboardMetrics>> { return { data: await repositories.dashboard.get() }; } },
  };
}
