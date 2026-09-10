import { createAuthController } from "@/backend/modules/auth";
import { startSession } from "@/frontend/lib/session";
import { handleAuth, readJson } from "../_handler";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleAuth(async () => {
    const user = await createAuthController().login(await readJson(request));
    await startSession(user);
    return Response.json({ data: user });
  });
}
