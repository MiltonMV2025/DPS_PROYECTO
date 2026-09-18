import { endSession } from "@/frontend/lib/session";
import { handleAuth } from "../_handler";

export const dynamic = "force-dynamic";

export function POST() {
  return handleAuth(async () => {
    await endSession();
    return Response.json({ data: { ok: true } });
  });
}
