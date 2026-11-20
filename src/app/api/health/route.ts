import { sql } from "drizzle-orm";
import { db, databaseEnvKeys, describeDatabaseError, resolveDatabaseUrl } from "@/db";
import { ensureSchema } from "@/db/ensure";

export const dynamic = "force-dynamic";

/**
 * Health check + diagnosis.
 * `ok:true` hanya bila koneksi Postgres hidup DAN skema siap.
 * Bila gagal, respons menjelaskan penyebabnya (tanpa membocorkan kredensial)
 * supaya tidak perlu membuka log Vercel.
 */
export async function GET() {
  const source = resolveDatabaseUrl();

  if (!source) {
    return Response.json(
      {
        ok: false,
        database: "not_configured",
        message:
          "Tidak ada connection string Postgres di environment. Attach database (Neon/Postgres) ke project Vercel, pastikan terpasang untuk Production, lalu Redeploy.",
        envKeysFound: databaseEnvKeys(),
        expected: ["DATABASE_URL", "POSTGRES_URL", "...atau <PREFIX>_DATABASE_URL"],
      },
      { status: 503 },
    );
  }

  try {
    await db.execute(sql`select 1`);
    await ensureSchema();
    return Response.json({
      ok: true,
      database: "ready",
      envKey: source.key,
      envKeysFound: databaseEnvKeys(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "error",
        envKey: source.key,
        error: describeDatabaseError(error),
        hint: "Cek apakah database aktif (Neon bisa auto-suspend), password benar, dan connection string memakai host pooled (…-pooler…).",
      },
      { status: 500 },
    );
  }
}
