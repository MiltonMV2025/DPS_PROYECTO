import { createMobileAuthController, requireMobileUser } from "@/backend/modules/auth";
import { handleAuth } from "../../_handler";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAuth(async () => {
    const context = await requireMobileUser(request);
    return Response.json({ data: await createMobileAuthController().me(context) });
  });
}
