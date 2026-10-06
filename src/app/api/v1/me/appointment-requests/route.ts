import { createAppointmentController } from "@/backend/modules/appointments";
import { requirePatientApiUser } from "../../_patient-auth";
import { handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleWrite(async () => {
    const context = await requirePatientApiUser(request);
    return createAppointmentController().requestForPatient(context.userId, await readJson(request));
  }, 201);
}
