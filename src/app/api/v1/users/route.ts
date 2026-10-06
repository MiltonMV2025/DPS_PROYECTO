import { createReadApi } from "@/backend/modules/read-api";
import { createUserService } from "@/backend/modules/users/user.service";
import { createSchema, suspendSchema, updateSchema } from "@/backend/modules/users/user.schema";
import { parseInput } from "@/backend/utils";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) { return handleGet(async () => { requireInternalApiKey(request); return createReadApi().users.list(); }); }
export function POST(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); return createUserService().create(parseInput(createSchema, await readJson(request))); }, 201); }
export function PUT(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); return createUserService().update(parseInput(updateSchema, await readJson(request))); }); }
export function PATCH(request: Request) { return handleWrite(async () => { const user = await requireApiUser(); requireApiRoles(user, ["administrador"]); const { id } = parseInput(suspendSchema, await readJson(request)); await createUserService().suspend(id, user.id); return { suspended: true }; }); }
