import { createMobileAuthController, requireMobileUser } from "@/backend/modules/auth";
import { handleAuth } from "../../_handler";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleAuth(async () => {
    const context = await requireMobileUser(request);
    await createMobileAuthController().logout(context);
    return Response.json({ data: { ok: true } });
  });
}
