import { createReadApi } from "@/backend/modules/read-api";
import { createSupplierService } from "@/backend/modules/suppliers/supplier.service";
import { createSchema, suspendSchema, updateSchema } from "@/backend/modules/suppliers/supplier.schema";
import { parseInput } from "@/backend/utils";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";
const READ_ROLES = ["administrador", "recepcionista"] as const;

async function authorizeRead(request: Request): Promise<void> {
  try { requireInternalApiKey(request); return; } catch { const user = await requireApiUser(); requireApiRoles(user, [...READ_ROLES]); }
}

export function GET(request: Request) { return handleGet(async () => { await authorizeRead(request); const categories = new URL(request.url).searchParams.getAll("category").filter(Boolean); return createReadApi().suppliers.list(categories); }); }
export function POST(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); return createSupplierService().create(parseInput(createSchema, await readJson(request))); }, 201); }
export function PUT(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); return createSupplierService().update(parseInput(updateSchema, await readJson(request))); }); }
export function PATCH(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); const { id } = parseInput(suspendSchema, await readJson(request)); await createSupplierService().suspend(id); return { suspended: true }; }); }
