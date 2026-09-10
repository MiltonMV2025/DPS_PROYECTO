import { createAppointmentController } from "@/backend/modules/appointments";
import { requireApiUser } from "@/frontend/lib/session";
import { handleWrite } from "../../_http";

export const dynamic = "force-dynamic";

export function GET() {
  return handleWrite(async () => {
    await requireApiUser();
    return createAppointmentController().manage();
  });
}
