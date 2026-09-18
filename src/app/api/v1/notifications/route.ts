import { createNotificationController } from "@/backend/modules/notifications";
import { requireApiUser } from "@/frontend/lib/session";
import { handleGet } from "../_http";

export const dynamic = "force-dynamic";

export function GET() {
  return handleGet(async () => {
    const user = await requireApiUser();
    const items = await createNotificationController().list(user.id);
    return { data: { items, unreadCount: items.filter((item) => !item.readAt).length } };
  });
}
