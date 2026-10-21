import { createPatientProfileController } from "@/backend/modules/patient-profile/profile.controller";
import { requireMobileUser } from "@/backend/modules/auth";
import { handleGet, handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleGet(async () => {
    const context = await requireMobileUser(request);
    return { data: await createPatientProfileController().get(context.user.id) };
  });
}

export function PATCH(request: Request) {
  return handleWrite(async () => {
    const context = await requireMobileUser(request);
    return createPatientProfileController().update(context.user.id, await readJson(request));
  });
}
