import { requireMobileRoles, requireMobileUser } from "@/backend/modules/auth";
import { createDeviceTokenService } from "@/backend/modules/notifications/device-token.service";
import { handleWrite, readJson } from "../../_http";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleWrite(async () => {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["administrador", "odontologo", "recepcionista", "paciente"]);
    await createDeviceTokenService().register(context.user.id, await readJson(request));
    return { registered: true };
  }, 201);
}

export function DELETE(request: Request) {
  return handleWrite(async () => {
    const context = await requireMobileUser(request);
    requireMobileRoles(context, ["administrador", "odontologo", "recepcionista", "paciente"]);
    const removed = await createDeviceTokenService().remove(context.user.id, await readJson(request));
    return { removed };
  });
}
