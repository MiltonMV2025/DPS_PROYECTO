import { getCurrentUser } from "@/frontend/lib/session";
import { handleAuth } from "../_handler";

export const dynamic = "force-dynamic";

export function GET() {
  return handleAuth(async () => {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: { code: "UNAUTHENTICATED", message: "No autenticado." } }, { status: 401 });
    }
    return Response.json({ data: user });
  });
}
