import { createAppointmentController } from "@/backend/modules/appointments";
import { requireMobileRoles, requireMobileUser } from "@/backend/modules/auth";
import { handleGet, handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleGet(async () => {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["paciente"]);
    return { data: await createAppointmentController().listForPatient(context.user.id) };
  });
}

export function POST(request: Request) {
  return handleWrite(async () => {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["paciente"]);
    const id = await createAppointmentController().createForPatient(context.user.id, await readJson(request));
    return { id };
  }, 201);
}
