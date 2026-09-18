import { createAppointmentController } from "@/backend/modules/appointments";
import { ApplicationError } from "@/backend/errors";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

type Context = { params: Promise<{ id: string }> };

function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApplicationError("INVALID_ID", "El identificador no es válido.", 400);
  return id;
}

export function PATCH(request: Request, { params }: Context) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const { id } = await params;
    return createAppointmentController().update(parseId(id), await readJson(request));
  });
}

export function DELETE(_request: Request, { params }: Context) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, ["administrador"]);
    const { id } = await params;
    await createAppointmentController().remove(parseId(id));
    return { ok: true };
  });
}
