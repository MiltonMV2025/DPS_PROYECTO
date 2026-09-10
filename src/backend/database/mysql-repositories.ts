import type { Pool } from "mysql2/promise";
import { getDatabasePool } from "./pool";
import { createReadRepository, type Repository } from "./repository";
import { mapAppointment, mapAppointmentSupply, mapClinicalRecord, mapInvoice, mapPatient, mapRadiograph, mapSupplier, mapSupply, mapUser, mapWaitingListEntry } from "./mappers";
import type { Appointment, AppointmentSupply, ClinicalRecord, Invoice, Patient, Radiograph, Supplier, Supply, User, WaitingListEntry } from "./entities";

export const createUserRepository = (pool?: Pool): Repository<User> => createReadRepository("Usuarios", mapUser, pool);
export const createPatientRepository = (pool?: Pool): Repository<Patient> => createReadRepository("Pacientes", mapPatient, pool);
export const createSupplierRepository = (pool?: Pool): Repository<Supplier> => createReadRepository("Proveedores", mapSupplier, pool);
export const createSupplyRepository = (pool?: Pool): Repository<Supply> => createReadRepository("Insumos", mapSupply, pool);
export const createAppointmentRepository = (pool?: Pool): Repository<Appointment> => createReadRepository("Citas", mapAppointment, pool);
export const createWaitingListRepository = (pool?: Pool): Repository<WaitingListEntry> => createReadRepository("Lista_Espera", mapWaitingListEntry, pool);
export const createClinicalRecordRepository = (pool?: Pool): Repository<ClinicalRecord> => createReadRepository("Historiales_Clinicos", mapClinicalRecord, pool);
export const createRadiographRepository = (pool?: Pool): Repository<Radiograph> => createReadRepository("Radiografias", mapRadiograph, pool);
export const createAppointmentSupplyRepository = (pool?: Pool): Repository<AppointmentSupply> => createReadRepository("Detalles_Cita_Insumos", mapAppointmentSupply, pool);
export const createInvoiceRepository = (pool?: Pool): Repository<Invoice> => createReadRepository("Facturacion", mapInvoice, pool);

export { getDatabasePool };

