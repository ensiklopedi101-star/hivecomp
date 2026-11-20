import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Also warms up tables on a fresh Vercel Postgres database. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await ensureSchema();
    return Response.json({ ok: true, database: "ready" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
