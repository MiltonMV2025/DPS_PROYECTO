export class ApplicationError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 500) {
    super(message);
  }
}

export function toHttpError(error: unknown) {
  if (error instanceof ApplicationError) return error;
  return new ApplicationError("DATABASE_UNAVAILABLE", "No se pudo consultar la información.", 503);
}
