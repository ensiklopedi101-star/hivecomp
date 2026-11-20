import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { settings } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { BRAND_SLUGS, type BrandSlug } from "@/lib/brands";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
// Logo disimpan sebagai data URL di dalam settings (JSONB) — bekerja sama
// baik di Postgres lokal maupun serverless Vercel tanpa storage eksternal.
const MAX_BYTES = 400_000; // ~400 KB sebelum base64

async function readSiteValue(): Promise<SiteSettings> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "site"))
    .limit(1);
  const raw = rows[0]?.value as Partial<SiteSettings> | undefined;
  if (!raw) return DEFAULT_SETTINGS;
  // Gabung seperlunya agar upload logo tidak menghapus field lain.
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    hero: { ...DEFAULT_SETTINGS.hero, ...raw.hero },
    urls: { ...DEFAULT_SETTINGS.urls, ...raw.urls },
    logos: { ...DEFAULT_SETTINGS.logos, ...raw.logos },
    contact: { ...DEFAULT_SETTINGS.contact, ...raw.contact },
    socials: { ...DEFAULT_SETTINGS.socials, ...raw.socials },
    targets: Array.isArray(raw.targets) && raw.targets.length === 4 ? raw.targets : DEFAULT_SETTINGS.targets,
  } as SiteSettings;
}

async function writeSiteValue(value: SiteSettings) {
  await db
    .insert(settings)
    .values({ key: "site", value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") ?? "");
    const file = form.get("file");
    if (!BRAND_SLUGS.includes(slug as BrandSlug)) {
      return NextResponse.json({ ok: false, error: "Brand tidak dikenal." }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "File kosong." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Format harus PNG, JPG, WEBP, SVG, atau GIF." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Ukuran maksimal 400 KB. Kompres logo dulu." },
        { status: 400 },
      );
    }

    await ensureSchema();
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;

    const current = await readSiteValue();
    const next: SiteSettings = {
      ...current,
      logos: { ...current.logos, [slug]: dataUrl },
    };
    await writeSiteValue(next);
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true, url: dataUrl });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal mengunggah." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as { slug?: unknown };
    const slug = String(body.slug ?? "");
    if (!BRAND_SLUGS.includes(slug as BrandSlug)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await ensureSchema();
    const current = await readSiteValue();
    const next: SiteSettings = {
      ...current,
      logos: { ...current.logos, [slug]: "" },
    };
    await writeSiteValue(next);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
