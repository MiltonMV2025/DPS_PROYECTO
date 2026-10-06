import { createAppointmentController } from "@/backend/modules/appointments";
import { requireMobileRoles, requireMobileUser } from "@/backend/modules/auth";
import { handleGet } from "../../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleGet(async () => {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["paciente"]);
    const params = new URL(request.url).searchParams;
    return {
      data: await createAppointmentController().availability({
        date: params.get("date") ?? "",
        idOdontologo: params.get("idOdontologo") ?? undefined,
        duracionMin: params.get("duracionMin") ?? undefined,
      }),
    };
  });
}
