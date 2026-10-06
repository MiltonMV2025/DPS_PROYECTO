import { createPatientController } from "@/backend/modules/patients/patient.controller";
import { createSchema, deleteSchema, updateSchema } from "@/backend/modules/patients/patient.schema";
import { createReadApi } from "@/backend/modules/read-api";
import { parseInput } from "@/backend/utils";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";
const MANAGE_ROLES = ["administrador", "odontologo"] as const;

export function GET(request: Request) { return handleGet(async () => { requireInternalApiKey(request); return createReadApi().patients.list(); }); }
export function POST(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, [...MANAGE_ROLES]); return createPatientController().create(parseInput(createSchema, await readJson(request))); }, 201); }
export function PUT(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, [...MANAGE_ROLES]); return createPatientController().update(parseInput(updateSchema, await readJson(request))); }); }
export function DELETE(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, [...MANAGE_ROLES]); const { id } = parseInput(deleteSchema, await readJson(request)); await createPatientController().remove(id); return { deleted: true }; }); }
