import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { settings } from "@/db/schema";
import type { BrandSlug } from "./brands";
import { SELECTED_LOGOS } from "./logo-concepts";
import { igUrl } from "./instagram";

export type SiteSettings = {
  hero: {
    kicker: string;
    line1: string;
    line2: string;
    line3a: string;
    line3b: string;
    description: string;
  };
  urls: Record<BrandSlug, string>;
  /** Corporate symbol; set only after explicitly applying a concept. */
  hiveLogo?: string;
  /** Logo tiap brand, disimpan sebagai data URL (diupload dari /admin). */
  logos: Record<BrandSlug, string>;
  contact: { email: string; whatsapp: string; location: string };
  socials: { facebook: string; instagram: string; youtube: string };
  /** Akun Instagram per brand (URL profil atau @handle). */
  instagram: Record<"popbeez" | "nusabeez", string>;
  targets: { to: number; suffix: string; label: string }[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    kicker: "HiveComp — Grup Media & Commerce",
    line1: "Lima Brand.",
    line2: "Satu Rumah.",
    line3a: "Satu",
    line3b: "Pintu Masuk.",
    description:
      "Lima brand media dan commerce dalam satu naungan — dari hiburan dan berita sampai marketplace. Satu halaman, satu pintu masuk bagi audiens, mitra, dan pelanggan.",
  },
  urls: {
    // Placeholder untuk demo — ganti dengan alamat resmi di /admin sebelum rilis.
    popbeez: "https://www.facebook.com/popbeez",
    nusabeez: "https://www.facebook.com/nusabeez",
    "portal-hub": "https://www.portal-hub.online",
    blinkbeez: "https://www.youtube.com/@blinkbeez",
    // Sengaja kosong: hostname pasti E-Beez ("e-beez.hive") belum diputuskan pemilik.
    "e-beez": "",
  },
  hiveLogo: `/logos/${SELECTED_LOGOS.hivecomp}-mark.svg`,
  logos: {
    popbeez: `/logos/${SELECTED_LOGOS.popbeez}-mark.svg`,
    nusabeez: `/logos/${SELECTED_LOGOS.nusabeez}-mark.svg`,
    "portal-hub": `/logos/${SELECTED_LOGOS["portal-hub"]}-mark.svg`,
    blinkbeez: `/logos/${SELECTED_LOGOS.blinkbeez}-mark.svg`,
    "e-beez": `/logos/${SELECTED_LOGOS["e-beez"]}-mark.svg`,
  },
  contact: {
    // Email, telepon, dan lokasi sengaja KOSONG sampai pemilik mengisinya di
    // /admin — jangan tampilkan kontak yang belum dipastikan ke pengunjung.
    email: "",
    whatsapp: "",
    location: "",
  },
  socials: {
    facebook: "",
    instagram: "",
    youtube: "",
  },
  instagram: { popbeez: "", nusabeez: "" },
  targets: [
    { to: 1500, suffix: "+", label: "Konten diproduksi / tahun" },
    { to: 500, suffix: " rb+", label: "Jangkauan gabungan / bulan" },
    { to: 100, suffix: " rb+", label: "Pengikut di seluruh platform" },
    { to: 5, suffix: "", label: "Brand dalam satu grup" },
  ],
};

/**
 * URL kanal/sosial: bila alamat diketik tanpa skema (mis. "ebeez.hivecomp.my.id"),
 * tambahkan https:// supaya tidak diperlakukan sebagai path relatif.
 */
const url = (v: unknown, fallback: string) => {
  if (typeof v !== "string" || !v.trim()) return fallback;
  const raw = v.trim();
  if (/^https?:\/\//i.test(raw)) return raw.slice(0, 300);
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(raw)) return `https://${raw}`.slice(0, 300);
  return fallback;
};

const str = (v: unknown, fallback: string, max = 400) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;



/** Logo hanya boleh berupa data URL gambar (upload admin) atau URL http(s). */
const logo = (v: unknown, fallback: string) => {
  if (typeof v !== "string" || !v.trim()) return fallback;
  const t = v.trim();
  if (t.startsWith("data:image/")) return t.slice(0, 600_000);
  if (/^\/logos\/(hivecomp|popbeez|nusabeez|blinkbeez|e-beez|portal-hub)-0[1-3]-mark\.svg$/.test(t)) return t;
  if (/^https:\/\//i.test(t)) return t.slice(0, 300);
  return fallback;
};

/** Read settings from DB and merge over defaults (never throws). */
export async function getSettings(): Promise<SiteSettings> {
  let raw: Partial<SiteSettings> | undefined;
  try {
    await ensureSchema();
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "site"))
      .limit(1);
    raw = rows[0]?.value as Partial<SiteSettings> | undefined;
  } catch {
    raw = undefined;
  }
  const d = DEFAULT_SETTINGS;
  if (!raw) return d;

  const targets =
    Array.isArray(raw.targets) && raw.targets.length === 4
      ? raw.targets.map((t, i) => ({
          to: Number.isFinite(Number(t?.to)) ? Math.max(0, Math.round(Number(t.to))) : d.targets[i].to,
          suffix: str(t?.suffix, d.targets[i].suffix, 12),
          label: str(t?.label, d.targets[i].label, 80),
        }))
      : d.targets;

  return {
    hiveLogo: logo(raw.hiveLogo, d.hiveLogo ?? ""),
    hero: {
      kicker: str(raw.hero?.kicker, d.hero.kicker, 120),
      line1: str(raw.hero?.line1, d.hero.line1, 60),
      line2: str(raw.hero?.line2, d.hero.line2, 60),
      line3a: str(raw.hero?.line3a, d.hero.line3a, 40),
      line3b: str(raw.hero?.line3b, d.hero.line3b, 40),
      description: str(raw.hero?.description, d.hero.description, 600),
    },
    urls: {
      popbeez: url(raw.urls?.popbeez, d.urls.popbeez),
      nusabeez: url(raw.urls?.nusabeez, d.urls.nusabeez),
      "portal-hub": url(raw.urls?.["portal-hub"], d.urls["portal-hub"]),
      blinkbeez: url(raw.urls?.blinkbeez, d.urls.blinkbeez),
      "e-beez": url(raw.urls?.["e-beez"], d.urls["e-beez"]),
    },
    logos: {
      popbeez: logo(raw.logos?.popbeez, d.logos.popbeez),
      nusabeez: logo(raw.logos?.nusabeez, d.logos.nusabeez),
      "portal-hub": logo(raw.logos?.["portal-hub"], d.logos["portal-hub"]),
      blinkbeez: logo(raw.logos?.blinkbeez, d.logos.blinkbeez),
      "e-beez": logo(raw.logos?.["e-beez"], d.logos["e-beez"]),
    },
    contact: {
      email: str(raw.contact?.email, d.contact.email, 160),
      whatsapp: str(raw.contact?.whatsapp, d.contact.whatsapp, 40),
      location: str(raw.contact?.location, d.contact.location, 160),
    },
    socials: {
      facebook: url(raw.socials?.facebook, d.socials.facebook),
      instagram: url(raw.socials?.instagram, d.socials.instagram),
      youtube: url(raw.socials?.youtube, d.socials.youtube),
    },
    instagram: {
      popbeez: igUrl(raw.instagram?.popbeez),
      nusabeez: igUrl(raw.instagram?.nusabeez),
    },
    targets,
  };
}
