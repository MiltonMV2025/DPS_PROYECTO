import { ApplicationError } from "@/backend/errors";

type Parser<T> = { safeParse: (value: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } } };

/** Validates raw input with a schema and raises a 400 ApplicationError on failure. */
export function parseInput<T>(schema: Parser<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error?.issues[0]?.message ?? "Datos inválidos.";
    throw new ApplicationError("VALIDATION", message, 400);
  }
  return result.data as T;
}
