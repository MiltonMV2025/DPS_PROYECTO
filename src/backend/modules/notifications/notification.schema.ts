/** Input validation contracts for notifications. */
import { z } from "zod";

export const notificationIdSchema = z.coerce.number().int().positive();
