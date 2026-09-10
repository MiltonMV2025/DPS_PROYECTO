export type UserRole = "administrador" | "odontologo" | "recepcionista" | "paciente";
export type SupplierStatus = "activo" | "evaluacion" | "inactivo";
export type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada";
export type WaitingListSlot = "manana" | "tarde" | "cualquiera";
export type WaitingListStatus = "en_espera" | "notificado" | "asignada" | "descartada";
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";
export type InvoiceStatus = "pendiente" | "pagada" | "anulada";

export type User = { idUsuario: number; nombre: string; correo: string; rol: UserRole; passwordHash: string; activo: boolean; ultimoAcceso: Date | null; creadoEn: Date };
export type Patient = { idPaciente: number; idUsuario: number; telefono: string; fechaNacimiento: string; alergias: string | null; creadoEn: Date };
export type Supplier = { idProveedor: number; razonSocial: string; categoria: string; contacto: string | null; telefono: string | null; correo: string | null; ultimaCompra: string | null; estado: SupplierStatus };
export type Supply = { idInsumo: number; nombre: string; categoria: string; unidadMedida: string; stockActual: number; stockMinimo: number; idProveedor: number | null };
export type Appointment = { idCita: number; idPaciente: number; idOdontologo: number; fechaHora: Date; duracionMin: 30 | 45 | 60; motivo: string | null; estado: AppointmentStatus; creadoEn: Date };
export type WaitingListEntry = { idEspera: number; idPaciente: number; fechaDeseada: string; franja: WaitingListSlot; motivo: string | null; prioridad: number; estado: WaitingListStatus; notificadoEn: Date | null; idCitaAsignada: number | null; creadoEn: Date };
export type ClinicalRecord = { idHistorial: number; idCita: number; diagnostico: string; tratamiento: string; observaciones: string | null; creadoEn: Date };
export type Radiograph = { idRadiografia: number; idHistorial: number; urlArchivo: string; descripcion: string | null; fecha: string };
export type AppointmentSupply = { idDetalle: number; idCita: number; idInsumo: number; cantidad: number };
export type Invoice = { idFactura: number; idCita: number; montoTotal: number; metodoPago: PaymentMethod; estado: InvoiceStatus; fechaEmision: Date };

