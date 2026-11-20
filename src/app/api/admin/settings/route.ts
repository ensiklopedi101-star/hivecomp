import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { settings } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import type { SiteSettings } from "@/lib/settings";

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    const value = (await req.json()) as Partial<SiteSettings>;
    if (!value || typeof value !== "object" || !value.hero || !value.urls) {
      return NextResponse.json({ ok: false, error: "Data tidak lengkap." }, { status: 400 });
    }
    await ensureSchema();
    await db
      .insert(settings)
      .values({ key: "site", value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
    // Refresh landing page, brand pages, and portal instantly.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal menyimpan." }, { status: 500 });
  }
}
