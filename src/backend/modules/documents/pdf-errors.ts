import { ZodError } from "zod";
import { ApplicationError } from "@/backend/errors";

export function mapPdfError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) return error;
  if (error instanceof ZodError) {
    return new ApplicationError("INVALID_PDF_DATA", "Los datos del documento no son válidos.", 400);
  }
  return new ApplicationError("PDF_GENERATION_FAILED", "No se pudo generar el PDF.", 500);
}
