import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { settings } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import {
  LOGO_BRANDS,
  SELECTED_LOGOS,
  type LogoSelections,
} from "@/lib/logo-concepts";
import LogoStudio from "@/components/logo-studio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Studio Logo — 18 Konsep untuk HiveComp & Lima Brand",
  description: "Tiga arah logo untuk HiveComp, PopBeez, NusaBeez, BlinkBeez, E-Beez, dan Portal-Hub. Bandingkan bentuk, warna, dan unduh aset vektor.",
  alternates: { canonical: "https://www.hivecomp.my.id/studio-logo" },
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  const admin = await isAdmin();
  let initial: LogoSelections = { ...SELECTED_LOGOS };
  if (admin) {
    try {
      await ensureSchema();
      const rows = await db.select().from(settings).where(eq(settings.key, "logo_concepts")).limit(1);
      const raw = (rows[0]?.value ?? {}) as Record<string, unknown>;
      for (const brand of LOGO_BRANDS) {
        const chosen = raw[brand.id];
        if (typeof chosen === "string" && brand.concepts.some((c) => c.id === chosen)) initial[brand.id] = chosen;
      }
    } catch { /* Gallery remains available even before a database is connected. */ }
  }
  return <LogoStudio initialSelections={initial} admin={admin} />;
}
