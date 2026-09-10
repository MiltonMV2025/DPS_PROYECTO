import { toHttpError } from "@/backend/errors";

export async function handleAuth(action: () => Promise<Response>): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    const mapped = toHttpError(error);
    return Response.json({ error: { code: mapped.code, message: mapped.message } }, { status: mapped.status });
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
