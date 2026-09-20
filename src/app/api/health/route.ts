import { getDatabasePool } from "@/backend/database/pool";

export const dynamic = "force-dynamic";

/**
 * Sonda de salud del despliegue.
 *
 * Antes respondia siempre { status: "ok" } sin comprobar nada, de modo que
 * seguia devolviendo 200 aunque la base de datos estuviera caida y la
 * aplicacion no pudiera atender ninguna pantalla. Ahora ejecuta un SELECT 1
 * contra MySQL para que el estado reportado corresponda con el estado real.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await getDatabasePool().query("SELECT 1");

    return Response.json({
      status: "ok",
      database: "up",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // No se propaga el detalle del error: expondria host, usuario o esquema.
    return Response.json(
      {
        status: "error",
        database: "down",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
