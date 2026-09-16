import { createNotificationController } from "@/backend/modules/notifications";
import { requireApiUser } from "@/frontend/lib/session";
import { handleWrite } from "../../_http";

export const dynamic = "force-dynamic";

export function PATCH() {
  return handleWrite(async () => {
    const user = await requireApiUser();
    return { updated: await createNotificationController().markAllRead(user.id) };
  });
}
