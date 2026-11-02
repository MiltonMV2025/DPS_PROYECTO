import { expect, test } from "@playwright/test";
import { ApplicationError } from "../../src/backend/errors";
import { handleAuth } from "../../src/app/api/v1/auth/_handler";
import {
  logGoogleAuthFailure,
  logGoogleAuthStage,
} from "../../mobile/src/auth/google-auth-diagnostics";

test("auth handler logs route and safe error metadata without request secrets", async () => {
  const entries: unknown[][] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => entries.push(args);
  try {
    const response = await handleAuth(async () => {
      throw new ApplicationError(
        "INVALID_GOOGLE_IDENTITY",
        "Token=private-token user=private@example.test",
        401,
      );
    }, "mobile.google.login");

    expect(response.status).toBe(401);
    const output = JSON.stringify(entries);
    expect(output).toContain("mobile.google.login");
    expect(output).toContain("INVALID_GOOGLE_IDENTITY");
    expect(output).toContain("401");
    expect(output).not.toContain("private-token");
    expect(output).not.toContain("private@example.test");
  } finally {
    console.warn = originalWarn;
  }
});

test("auth handler logs a safe underlying error code for unexpected failures", async () => {
  const entries: unknown[][] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => entries.push(args);
  try {
    const error = Object.assign(new Error("do not log this message"), {
      code: "auth/internal-error",
    });
    const response = await handleAuth(async () => {
      throw error;
    }, "mobile.google.register");

    expect(response.status).toBe(503);
    const output = JSON.stringify(entries);
    expect(output).toContain("mobile.google.register");
    expect(output).toContain("DATABASE_UNAVAILABLE");
    expect(output).toContain("auth/internal-error");
    expect(output).not.toContain("do not log this message");
  } finally {
    console.error = originalError;
  }
});

test("native Google auth diagnostics include stage and safe code, never error text", () => {
  const entries: unknown[][] = [];
  const originalWarn = console.warn;
  const originalInfo = console.info;
  console.warn = (...args: unknown[]) => entries.push(args);
  console.info = (...args: unknown[]) => entries.push(args);
  try {
    logGoogleAuthStage("firebase_authenticated");
    logGoogleAuthFailure(
      "firebase_credential",
      Object.assign(new Error("idToken=secret email=person@example.test"), {
        code: "auth/invalid-credential",
      }),
    );
    const output = JSON.stringify(entries);
    expect(output).toContain("firebase_authenticated");
    expect(output).toContain("firebase_credential");
    expect(output).toContain("auth/invalid-credential");
    expect(output).not.toContain("secret");
    expect(output).not.toContain("person@example.test");
  } finally {
    console.warn = originalWarn;
    console.info = originalInfo;
  }
});
