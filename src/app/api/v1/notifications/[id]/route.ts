import { createNotificationController } from "@/backend/modules/notifications";
import { requireApiUser } from "@/frontend/lib/session";
import { handleWrite } from "../../_http";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export function PATCH(_request: Request, { params }: Context) {
  return handleWrite(async () => {
    const user = await requireApiUser();
    const { id } = await params;
    await createNotificationController().markRead(user.id, id);
    return { ok: true };
  });
}
