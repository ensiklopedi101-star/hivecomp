import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { connectorGuidance } from "@/db/schema";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    await ensureSchema();
    const rows = await db.select().from(connectorGuidance);
    return NextResponse.json({ ok: true, guidance: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: true, guidance: [] }, { status: 200 });
  }
}
