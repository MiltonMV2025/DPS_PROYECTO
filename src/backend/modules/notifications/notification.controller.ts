/** HTTP-facing orchestration boundary for notifications. */
import { parseInput } from "@/backend/utils";
import { notificationIdSchema } from "./notification.schema";
import { createNotificationService, type NotificationService } from "./notification.service";

export function createNotificationController(service: NotificationService = createNotificationService()) {
  return {
    list: (userId: number) => service.list(userId),
    markRead: (userId: number, rawId: unknown) => service.markRead(parseInput(notificationIdSchema, rawId), userId),
    markAllRead: (userId: number) => service.markAllRead(userId),
  };
}

export type NotificationController = ReturnType<typeof createNotificationController>;
