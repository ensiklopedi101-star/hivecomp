import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { settings } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { LOGO_BRANDS, findLogoBrand, type LogoSelections } from "@/lib/logo-concepts";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export const dynamic = "force-dynamic";

function validChoices(input: unknown): LogoSelections | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const entries = Object.entries(input);
  if (!entries.length || entries.length > 6) return null;
  const choices: LogoSelections = {};
  for (const [brandId, conceptId] of entries) {
    const brand = findLogoBrand(brandId);
    if (!brand || typeof conceptId !== "string" || !brand.concepts.some((c) => c.id === conceptId)) return null;
    choices[brand.id] = conceptId;
  }
  return choices;
}

async function authorized(req?: Request) {
  if (!(await isAdmin())) return false;
  const origin = req?.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req!.url).host) return false;
  return true;
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Silakan masuk sebagai admin." }, { status: 401 });
  await ensureSchema();
  const rows = await db.select().from(settings).where(eq(settings.key, "logo_concepts")).limit(1);
  return NextResponse.json({ ok: true, selections: rows[0]?.value ?? {} }, { headers: { "Cache-Control": "no-store" } });
}

/** Save a shortlist only. Does not change the existing site logos. */
export async function PUT(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Silakan masuk sebagai admin." }, { status: 401 });
  try {
    const body = await req.json();
    const choices = validChoices(body.selections ?? { [body.brand]: body.concept });
    if (!choices) return NextResponse.json({ error: "Pilihan logo tidak valid." }, { status: 400 });
    await ensureSchema();
    await db.insert(settings).values({ key: "logo_concepts", value: choices }).onConflictDoUpdate({
      target: settings.key,
      set: { value: sql`coalesce(${settings.value}, '{}'::jsonb) || ${JSON.stringify(choices)}::jsonb`, updatedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Pilihan belum tersimpan. Coba lagi." }, { status: 500 });
  }
}

/** Explicitly apply the chosen marks after the admin confirms in the UI. */
export async function POST(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Silakan masuk sebagai admin." }, { status: 401 });
  try {
    const body = await req.json();
    const choices = validChoices(body.selections);
    if (!choices) return NextResponse.json({ error: "Pilih sedikitnya satu logo." }, { status: 400 });
    await ensureSchema();
    const brandLogos: Record<string, string> = {};
    let hiveLogo = "";
    for (const b of LOGO_BRANDS) {
      if (choices[b.id]) {
        const url = `/logos/${choices[b.id]}-mark.svg`;
        if (b.id === "hivecomp") hiveLogo = url;
        else brandLogos[b.id] = url;
      }
    }
    await db.transaction(async (tx) => {
      await tx.insert(settings).values({ key: "logo_concepts", value: choices }).onConflictDoUpdate({
        target: settings.key,
        set: { value: sql`coalesce(${settings.value}, '{}'::jsonb) || ${JSON.stringify(choices)}::jsonb`, updatedAt: new Date() },
      });
      const identityPatch = hiveLogo ? { hiveLogo } : {};
      await tx.insert(settings).values({
        key: "site",
        value: { ...DEFAULT_SETTINGS, ...identityPatch, logos: { ...DEFAULT_SETTINGS.logos, ...brandLogos } },
      }).onConflictDoUpdate({
        target: settings.key,
        set: {
          value: sql`coalesce(${settings.value}, '{}'::jsonb)
            || ${JSON.stringify(identityPatch)}::jsonb
            || jsonb_build_object('logos', coalesce(${settings.value}->'logos', '{}'::jsonb) || ${JSON.stringify(brandLogos)}::jsonb)`,
          updatedAt: new Date(),
        },
      });
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, applied: Object.keys(choices).length });
  } catch {
    return NextResponse.json({ error: "Logo belum diterapkan. Coba lagi." }, { status: 500 });
  }
}
