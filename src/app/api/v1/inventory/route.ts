import { createReadApi } from "@/backend/modules/read-api";
import { parseInput } from "@/backend/utils";
import { createInventoryService } from "@/backend/modules/inventory/inventory.service";
import { createSchema, deleteSchema, updateSchema } from "@/backend/modules/inventory/inventory.schema";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";
const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

export function GET(request: Request) {
  return handleGet(async () => {
    requireInternalApiKey(request);
    return createReadApi().inventory.list();
  });
}

export function POST(request: Request) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const input = parseInput(createSchema, await readJson(request));
    return { id: await createInventoryService().create(input) };
  }, 201);
}

export function PUT(request: Request) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const input = parseInput(updateSchema, await readJson(request));
    await createInventoryService().update(input.id, input);
    return { updated: true };
  });
}

export function DELETE(request: Request) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const { id } = parseInput(deleteSchema, await readJson(request));
    await createInventoryService().remove(id);
    return { deleted: true };
  });
}
