/** Domain contracts for notifications. */
export type NotificationType = "appointment_pending" | "appointment_confirmed" | "appointment_cancelled" | "appointment_completed";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId: number | null;
  readAt: string | null;
  createdAt: string;
};
