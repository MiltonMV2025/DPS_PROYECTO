import type { Pool, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "./pool";
import type { AppointmentListItem, ClinicalRecordListItem, DashboardMetrics, InventoryListItem, PatientListItem, SupplierListItem, UserListItem } from "@/backend/modules/read-models";

type Row = RowDataPacket & Record<string, unknown>;
const text = (v: unknown) => (v == null ? "" : String(v));
const nullable = (v: unknown) => (v == null ? null : String(v));
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : text(v));

export type ReadRepositories = {
  appointments: { findAll(): Promise<AppointmentListItem[]> };
  patients: { findAll(): Promise<PatientListItem[]> };
  inventory: { findAll(): Promise<InventoryListItem[]> };
  suppliers: { findAll(): Promise<SupplierListItem[]> };
  clinicalRecords: { findAll(): Promise<ClinicalRecordListItem[]> };
  users: { findAll(): Promise<UserListItem[]> };
  dashboard: { get(): Promise<DashboardMetrics> };
};

export function createReadRepositories(pool: Pool = getDatabasePool()): ReadRepositories {
  const list = <T>(query: string, map: (row: Row) => T) => ({ async findAll() { const [rows] = await pool.query<Row[]>(query); return rows.map(map); } });
  return {
    appointments: list(`SELECT c.id_cita, c.fecha_hora, c.motivo, c.estado, c.duracion_min, up.nombre patient_name, uo.nombre dentist_name FROM Citas c JOIN Pacientes p ON p.id_paciente=c.id_paciente JOIN Usuarios up ON up.id_usuario=p.id_usuario JOIN Usuarios uo ON uo.id_usuario=c.id_odontologo WHERE c.fecha_hora >= NOW() AND c.estado <> 'cancelada' ORDER BY c.fecha_hora`, r => ({ id: Number(r.id_cita), dateTime: iso(r.fecha_hora), patient: text(r.patient_name), dentist: text(r.dentist_name), service: text(r.motivo), status: text(r.estado), durationMin: Number(r.duracion_min) })),
    patients: list(`SELECT p.id_paciente, u.nombre, u.correo, p.telefono, p.fecha_nacimiento, p.alergias FROM Pacientes p JOIN Usuarios u ON u.id_usuario=p.id_usuario ORDER BY u.nombre`, r => ({ id: Number(r.id_paciente), name: text(r.nombre), email: text(r.correo), phone: text(r.telefono), birthDate: text(r.fecha_nacimiento), allergies: nullable(r.alergias) })),
    inventory: list(`SELECT i.id_insumo, i.nombre, i.categoria, i.unidad_medida, i.stock_actual, i.stock_minimo, p.razon_social FROM Insumos i LEFT JOIN Proveedores p ON p.id_proveedor=i.id_proveedor ORDER BY i.nombre`, r => ({ id: Number(r.id_insumo), name: text(r.nombre), category: text(r.categoria), unit: text(r.unidad_medida), currentStock: Number(r.stock_actual), minimumStock: Number(r.stock_minimo), supplierId: r.id_proveedor == null ? null : Number(r.id_proveedor), supplier: nullable(r.razon_social), stockStatus: Number(r.stock_actual) <= Number(r.stock_minimo) ? "low" : "ok" })),
    suppliers: list(`SELECT id_proveedor, razon_social, categoria, contacto, telefono, correo, ultima_compra, estado FROM Proveedores ORDER BY razon_social`, r => ({ id: Number(r.id_proveedor), businessName: text(r.razon_social), category: text(r.categoria), contact: nullable(r.contacto), phone: nullable(r.telefono), email: nullable(r.correo), lastPurchase: nullable(r.ultima_compra), status: text(r.estado) })),
    clinicalRecords: list(`SELECT h.id_historial, h.id_cita, h.diagnostico, h.tratamiento, h.observaciones, h.creado_en, u.nombre patient_name FROM Historiales_Clinicos h JOIN Citas c ON c.id_cita=h.id_cita JOIN Pacientes p ON p.id_paciente=c.id_paciente JOIN Usuarios u ON u.id_usuario=p.id_usuario ORDER BY h.creado_en DESC`, r => ({ id: Number(r.id_historial), appointmentId: Number(r.id_cita), patient: text(r.patient_name), diagnosis: text(r.diagnostico), treatment: text(r.tratamiento), observations: nullable(r.observaciones), createdAt: iso(r.creado_en) })),
    users: list(`SELECT id_usuario, nombre, correo, rol, activo, ultimo_acceso FROM Usuarios ORDER BY nombre`, r => ({ id: Number(r.id_usuario), name: text(r.nombre), email: text(r.correo), role: text(r.rol), active: Boolean(r.activo), lastAccess: r.ultimo_acceso == null ? null : iso(r.ultimo_acceso) })),
    dashboard: { async get() { const [[today], [patients], [revenue], [restock], [occupancy], [confirmation], breakdown] = await Promise.all([pool.query<Row[]>(`SELECT COUNT(*) value FROM Citas WHERE DATE(fecha_hora)=CURRENT_DATE AND estado <> 'cancelada'`), pool.query<Row[]>(`SELECT COUNT(*) value FROM Pacientes p JOIN Usuarios u ON u.id_usuario=p.id_usuario WHERE u.activo=TRUE`), pool.query<Row[]>(`SELECT COALESCE(SUM(monto_total),0) value FROM Facturacion WHERE estado='pagada' AND fecha_emision >= DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')`), pool.query<Row[]>(`SELECT COUNT(*) value FROM Insumos WHERE stock_actual <= stock_minimo`), pool.query<Row[]>(`SELECT COALESCE(ROUND(COUNT(CASE WHEN estado <> 'cancelada' THEN 1 END) / NULLIF(COUNT(*),0) * 100),0) value FROM Citas WHERE fecha_hora >= CURRENT_DATE AND fecha_hora < CURRENT_DATE + INTERVAL 1 DAY`), pool.query<Row[]>(`SELECT COALESCE(ROUND(COUNT(CASE WHEN estado IN ('confirmada','completada') THEN 1 END) / NULLIF(COUNT(*),0) * 100),0) value FROM Citas WHERE fecha_hora >= CURRENT_DATE - INTERVAL 30 DAY`), pool.query<Row[]>(`SELECT estado, COUNT(*) total FROM Citas GROUP BY estado`) ]); const counts = new Map((breakdown[0] as Row[]).map(r => [text(r.estado), Number(r.total)])); const statusBreakdown = ["pendiente", "confirmada", "completada", "cancelada"].map(estado => ({ estado, total: counts.get(estado) ?? 0 })); return { appointmentsToday: Number(today[0]?.value ?? 0), activePatients: Number(patients[0]?.value ?? 0), monthlyRevenue: Number(revenue[0]?.value ?? 0), suppliesToRestock: Number(restock[0]?.value ?? 0), occupancy: Number(occupancy[0]?.value ?? 0), confirmationRate: Number(confirmation[0]?.value ?? 0), monthlyGoal: 0, statusBreakdown }; } },
  };
}
