import { expect, test } from "@playwright/test";
import { Alert } from "../../src/frontend/components/ui/alert";

test("success and error feedback expose appropriate live roles", () => {
  const success = Alert({
    variant: "success",
    children: "Vista local preparada",
  });
  const error = Alert({ variant: "error", children: "No se pudo completar" });
  expect(success.props.role).toBe("status");
  expect(success.props.className).toContain("text-emerald-900");
  expect(error.props.role).toBe("alert");
  expect(error.props.className).toContain("text-red-900");
  expect(error.props["aria-atomic"]).toBe("true");
});
