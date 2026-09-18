import { ApplicationError } from "@/backend/errors";
import { createSupplierRepository } from "./supplier.repository";
import type { CreateSupplierInput, UpdateSupplierInput } from "./supplier.schema";

export function createSupplierService() {
  const repository = createSupplierRepository();
  return {
    async create(input: CreateSupplierInput) { try { return { id: await repository.create(input) }; } catch (error) { if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_BUSINESS_NAME", "Ya existe un proveedor con esa razón social.", 409); throw error; } },
    async update(input: UpdateSupplierInput) { try { await repository.update(input); } catch (error) { if (error instanceof Error && error.message === "SUPPLIER_NOT_FOUND") throw new ApplicationError("SUPPLIER_NOT_FOUND", "El proveedor no existe.", 404); if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_BUSINESS_NAME", "Ya existe un proveedor con esa razón social.", 409); throw error; } },
    async suspend(id: number) { try { await repository.suspend(id); } catch (error) { if (error instanceof Error && error.message === "SUPPLIER_ALREADY_SUSPENDED") throw new ApplicationError("SUPPLIER_ALREADY_SUSPENDED", "El proveedor ya está suspendido.", 409); throw error; } },
  };
}
function isDuplicateError(error: unknown): boolean { return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY"; }
export type SupplierService = ReturnType<typeof createSupplierService>;
