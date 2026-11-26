import { requireMobileRoles, requireMobileUser } from "@/backend/modules/auth";
import { requireApiRoles, requireApiUser } from "@/frontend/lib/session";

export type PatientApiContext = {
  userId: number;
  transport: "web" | "mobile";
};

/** Adapts the two supported transports without changing Web cookie auth. */
export async function requirePatientApiUser(request: Request): Promise<PatientApiContext> {
  if (request.headers.get("authorization")) {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["paciente"]);
    return { userId: context.user.id, transport: "mobile" };
  }

  const user = await requireApiUser();
  requireApiRoles(user, ["paciente"]);
  return { userId: user.id, transport: "web" };
}
