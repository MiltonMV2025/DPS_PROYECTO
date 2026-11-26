export type GoogleAuthStage =
  | "native_modules"
  | "google_configuration"
  | "play_services"
  | "google_account_picker"
  | "google_account_creation"
  | "google_explicit_sign_in"
  | "firebase_credential"
  | "firebase_sign_in"
  | "firebase_authenticated"
  | "firebase_id_token";

const SAFE_ERROR_CODES = /^(?:auth\/[a-z0-9-]{1,48}|[A-Z0-9_]{1,48})$/;

export function logGoogleAuthStage(
  stage: GoogleAuthStage,
  outcome: "completed" | "cancelled" = "completed",
): void {
  console.info(
    "[google-auth]",
    JSON.stringify({ event: "google_auth_stage", stage, outcome }),
  );
}

export function logGoogleAuthFailure(
  stage: GoogleAuthStage,
  error: unknown,
): void {
  const rawCode =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;
  const code =
    typeof rawCode === "string" && SAFE_ERROR_CODES.test(rawCode)
      ? rawCode
      : "UNKNOWN";
  console.warn(
    "[google-auth]",
    JSON.stringify({ event: "google_auth_failed", stage, code }),
  );
}
