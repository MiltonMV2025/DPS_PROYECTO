import { expect, test } from "@playwright/test";
import { formatDateOnly, formatDateTime } from "../../src/frontend/lib/display-date";

test("formats instants in El Salvador without exposing ISO timestamps", () => {
  expect(formatDateTime("2026-11-20T03:02:49.000Z")).toBe("19/11/2026 21:02");
  expect(formatDateTime("invalid")).toBe("invalid");
});

test("preserves calendar dates without shifting the day", () => {
  expect(formatDateOnly("1995-05-15T00:00:00.000Z")).toBe("15/05/1995");
  expect(formatDateOnly("1995-05-15")).toBe("15/05/1995");
});
