/** Application service boundary for notifications. */
import { ApplicationError } from "@/backend/errors";
import { createNotificationRepository, type NotificationRepository } from "./notification.repository";
import type { NotificationType } from "./notification.types";

export function createNotificationService(repository: NotificationRepository = createNotificationRepository()) {
  return {
    list: (userId: number) => repository.listForUser(userId),
    async markRead(id: number, userId: number) {
      if (!(await repository.markRead(id, userId))) throw new ApplicationError("NOTIFICATION_NOT_FOUND", "La notificación no existe.", 404);
    },
    markAllRead: (userId: number) => repository.markAllRead(userId),
    create: (userId: number, type: NotificationType, title: string, message: string, appointmentId: number) => repository.create(userId, type, title, message, appointmentId),
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
