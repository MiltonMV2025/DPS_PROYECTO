import { expect, test } from "@playwright/test";
import { ZodError } from "zod";
import { ApplicationError } from "../../src/backend/errors";
import { mapPdfError } from "../../src/backend/modules/documents/pdf-errors";

test("distinguishes invalid PDF input from a database error", () => {
  const error = mapPdfError(new ZodError([]));
  expect(error.status).toBe(400);
  expect(error.code).toBe("INVALID_PDF_DATA");
});

test("reports PDF generation failures without claiming the database failed", () => {
  const error = mapPdfError(new Error("private details"));
  expect(error.status).toBe(500);
  expect(error.code).toBe("PDF_GENERATION_FAILED");
  expect(error.message).not.toContain("private details");
});

test("preserves authentication errors", () => {
  const original = new ApplicationError("UNAUTHENTICATED", "No autenticado.", 401);
  expect(mapPdfError(original)).toBe(original);
});
