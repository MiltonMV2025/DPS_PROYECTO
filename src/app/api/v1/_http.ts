import { toHttpError } from "@/backend/errors";
import { ApplicationError } from "@/backend/errors";

export function requireInternalApiKey(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) throw new ApplicationError("INTERNAL_API_NOT_CONFIGURED", "La API interna no está configurada.", 503);
  if (request.headers.get("x-internal-api-key") !== secret) throw new ApplicationError("UNAUTHORIZED", "No autorizado.", 401);
}

export async function handleGet<T>(action: () => Promise<T>) {
  try { return Response.json(await action()); }
  catch (error) { const mapped = toHttpError(error); return Response.json({ error: { code: mapped.code, message: mapped.message } }, { status: mapped.status }); }
}

export async function handleWrite<T>(action: () => Promise<T>, status = 200) {
  try { return Response.json({ data: await action() }, { status }); }
  catch (error) { const mapped = toHttpError(error); return Response.json({ error: { code: mapped.code, message: mapped.message } }, { status: mapped.status }); }
}

export async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { return {}; }
}
