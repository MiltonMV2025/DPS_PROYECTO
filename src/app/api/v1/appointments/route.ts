import { createAppointmentController } from "@/backend/modules/appointments";
import { createReadApi } from "@/backend/modules/read-api";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";

const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

export function GET(request: Request) {
  return handleGet(async () => {
    if (request.headers.get("x-internal-api-key")) {
      requireInternalApiKey(request);
      return createReadApi().appointments.list();
    }
    const user = await requireApiUser();
    return createAppointmentController().list(user.rol === "paciente" ? user.id : undefined);
  });
}

export function POST(request: Request) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    requireApiRoles(user, [...STAFF]);
    const id = await createAppointmentController().create(await readJson(request));
    return { id };
  }, 201);
}
