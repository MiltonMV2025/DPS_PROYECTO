import { requireMobileUser } from "@/backend/modules/auth";
import { createPatientProfileController } from "@/backend/modules/patient-profile/profile.controller";
import { handleGet } from "../../_http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleGet(async () => {
    const context = await requireMobileUser(request);
    const profile = await createPatientProfileController().get(context.user.id);
    return { data: profile.records };
  });
}
