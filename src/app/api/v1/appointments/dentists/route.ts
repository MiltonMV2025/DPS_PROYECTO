import { createAppointmentController } from "@/backend/modules/appointments";
import { requirePatientApiUser } from "../../_patient-auth";
import { handleGet } from "../../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleGet(async () => {
    await requirePatientApiUser(request);
    return { data: await createAppointmentController().listDentists() };
  });
}
