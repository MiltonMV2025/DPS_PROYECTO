import { createMobileAuthController } from "@/backend/modules/auth";
import { handleAuth, readJson } from "../../_handler";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleAuth(async () => Response.json({ data: await createMobileAuthController().refresh(await readJson(request)) }));
}
