import { ApplicationError } from "@/backend/errors";
import { createAppointmentController } from "@/backend/modules/appointments";
import { requireMobileRoles, requireMobileUser } from "@/backend/modules/auth";
import { handleWrite } from "../../../../_http";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApplicationError("INVALID_ID", "El identificador no es válido.", 400);
  return id;
}

export function PATCH(_request: Request, { params }: Context) {
  return handleWrite(async () => {
    const context = await requireMobileUser(_request);
    requireMobileRoles(context, ["paciente"]);
    const { id } = await params;
    return createAppointmentController().cancelForPatient(parseId(id), context.user.id);
  });
}
