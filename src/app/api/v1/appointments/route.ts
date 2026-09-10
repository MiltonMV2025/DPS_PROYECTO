import { createReadApi } from "@/backend/modules/read-api";
import { createAppointmentController } from "@/backend/modules/appointments";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";
import { handleGet, handleWrite, readJson, requireInternalApiKey } from "../_http";

export const dynamic = "force-dynamic";

const STAFF = ["administrador", "recepcionista", "odontologo"] as const;

export function GET(request: Request) {
  return handleGet(async () => {
    requireInternalApiKey(request);
    return createReadApi().appointments.list();
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
