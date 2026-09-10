import { createAppointmentController } from "@/backend/modules/appointments";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

type Context = { params: Promise<{ id: string }> };

export function PATCH(request: Request, { params }: Context) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const { id } = await params;
    return createAppointmentController().update(Number(id), await readJson(request));
  });
}

export function DELETE(_request: Request, { params }: Context) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, ["administrador"]);
    const { id } = await params;
    await createAppointmentController().remove(Number(id));
    return { ok: true };
  });
}
