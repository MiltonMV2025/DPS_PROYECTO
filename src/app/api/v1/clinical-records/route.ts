import { createReadApi } from "@/backend/modules/read-api";
import { handleGet, requireInternalApiKey } from "../_http";
export const dynamic = "force-dynamic";
export function GET(request: Request) { return handleGet(async () => { requireInternalApiKey(request); return createReadApi().clinicalRecords.list(); }); }

