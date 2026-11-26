import { toHttpError } from "@/backend/errors";

const SAFE_CAUSE_CODES =
  /^(?:auth\/[a-z0-9-]{1,48}|ER_[A-Z0-9_]{1,48}|ECONN(?:REFUSED|RESET|TIMEDOUT)|ETIMEDOUT|ENOTFOUND|EAI_AGAIN)$/;

function getSafeCauseCode(error: unknown): string | undefined {
  if (
    error instanceof Error &&
    error.message === "Firebase Admin credentials are not configured"
  ) {
    return "firebase_admin_not_configured";
  }
  if (typeof error !== "object" || error === null || !("code" in error))
    return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && SAFE_CAUSE_CODES.test(code)
    ? code
    : undefined;
}

export async function handleAuth(
  action: () => Promise<Response>,
  route = "auth.unknown",
): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    const mapped = toHttpError(error);
    const diagnostic = {
      event: "auth_request_failed",
      route,
      status: mapped.status,
      code: mapped.code,
      ...(getSafeCauseCode(error)
        ? { causeCode: getSafeCauseCode(error) }
        : {}),
    };
    const log = mapped.status >= 500 ? console.error : console.warn;
    log("[auth-api]", JSON.stringify(diagnostic));
    return Response.json(
      { error: { code: mapped.code, message: mapped.message } },
      { status: mapped.status },
    );
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
