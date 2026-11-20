import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { leads } from "@/db/schema";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function escapeCsv(val: string): string {
  const cleaned = val.replace(/\r?\n/g, " ");
  if (/[",;]/.test(cleaned)) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    await ensureSchema();
    const rows = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(1000);
    const header = ["ID", "Tanggal", "Nama", "Kontak", "Kategori", "Pesan"].join(",");
    const lines = rows.map((r) =>
      [
        String(r.id),
        escapeCsv(new Date(r.createdAt).toISOString()),
        escapeCsv(r.name),
        escapeCsv(r.contact),
        escapeCsv(r.interest),
        escapeCsv(r.message),
      ].join(","),
    );
    // Include UTF-8 BOM (\uFEFF) so Microsoft Excel opens UTF-8 characters properly
    const csv = `\uFEFF${[header, ...lines].join("\r\n")}\r\n`;
    const dateSlug = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hivecomp-leads-${dateSlug}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal mengekspor CSV." }, { status: 500 });
  }
}
