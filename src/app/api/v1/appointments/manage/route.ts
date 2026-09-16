import { createAppointmentController } from "@/backend/modules/appointments";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleWrite } from "../../_http";

export const dynamic = "force-dynamic";
const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

export function GET() {
  return handleWrite(async () => {
    const user = await requireApiUser();
    if (user.rol !== "paciente") requireApiRoles(user, [...STAFF]);
    return createAppointmentController().manage(user.rol === "paciente" ? user.id : undefined);
  });
}
