import { BRANDS, BRAND_SLUGS } from "./brands";
import { DEFAULT_SETTINGS, type SiteSettings } from "./settings";

export type PreflightCheck = {
  label: string;
  ok: boolean;
  note: string;
  optional?: boolean;
};

const placeholder = (value: string, fallback: string) =>
  !value.trim() || value.trim() === fallback.trim();

/** Server-computed readiness list — no invented data, just compares to defaults. */
export function buildPreflight(
  s: SiteSettings,
  adminPasswordSet: boolean,
): PreflightCheck[] {
  const d = DEFAULT_SETTINGS;

  const checks: PreflightCheck[] = [
    {
      label: "Password admin",
      ok: adminPasswordSet,
      note: adminPasswordSet
        ? "ADMIN_PASSWORD sudah diset."
        : "Masih memakai password default hive-admin — set ADMIN_PASSWORD di env.",
    },
    {
      label: "Email kontak",
      ok: s.contact.email.trim().length > 0,
      note: s.contact.email.trim() ? s.contact.email : "Kosong — isi di tab Tampilan & URL.",
    },
    {
      label: "WhatsApp resmi",
      ok: s.contact.whatsapp.trim().length > 0,
      note: s.contact.whatsapp.trim()
        ? `${s.contact.whatsapp} (mengaktifkan tombol Chat WhatsApp di Hero, Kontak, Media Kit & Admin)`
        : "Kosong — isi di tab Tampilan & URL untuk mengaktifkan tombol wa.me.",
    },
  ];

  BRAND_SLUGS.forEach((slug) => {
    const url = s.urls[slug];
    const isPlaceholder = placeholder(url, d.urls[slug]);
    checks.push({
      label: `URL ${BRANDS[slug].name}`,
      ok: !isPlaceholder,
      note: isPlaceholder
        ? url.trim()
          ? "Masih berisi URL contoh — ganti dengan alamat asli."
          : "Belum diisi — CTA belum aktif."
        : url,
    });
  });

  const targetsChanged = JSON.stringify(s.targets) !== JSON.stringify(d.targets);
  checks.push({
    label: "Angka target",
    ok: targetsChanged,
    note: targetsChanged
      ? "Sudah disesuaikan."
      : "Masih angka template ilustrasi — ganti bila ingin dipakai di produksi.",
  });

  const socials = Object.values(s.socials).filter((v) => v.trim().length > 0).length;
  checks.push({
    label: "Tautan media sosial",
    ok: socials > 0,
    optional: true,
    note: socials > 0 ? `${socials} tautan terisi.` : "Kosong — ikon sosial disembunyikan otomatis.",
  });

  const waWebhook = Boolean(process.env.WHATSAPP_NOTIFY_WEBHOOK_URL?.trim());
  checks.push({
    label: "Webhook Notifikasi WhatsApp Otomatis",
    ok: waWebhook,
    optional: true,
    note: waWebhook
      ? "WHATSAPP_NOTIFY_WEBHOOK_URL aktif — lead baru langsung dikirim ke WhatsApp."
      : "Belum diset — Anda tetap bisa membalas/meneruskan pesan via tombol WhatsApp di tab Pesan Masuk.",
  });

  for (const k of ["popbeez", "nusabeez"] as const) {
    const has = s.instagram[k].trim().length > 0;
    checks.push({
      label: `Instagram ${BRANDS[k].name}`,
      ok: has,
      optional: true,
      note: has ? s.instagram[k] : "Belum diisi — tombol Instagram disembunyikan otomatis.",
    });
  }

  const metaReady = !!(
    process.env.META_PAGE_TOKEN &&
    process.env.META_PAGE_ID_POPBEEZ &&
    process.env.META_PAGE_ID_NUSABEEZ
  );
  checks.push({
    label: "Konektor Meta (Showcase Pop/Nusa — cache 5 menit)",
    ok: metaReady,
    optional: true,
    note: metaReady
      ? "Kredensial terdeteksi."
      : "Belum diset — panel tampil jujur sebagai 'belum terhubung'.",
  });

  const ytReady = !!(
    process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID_BLINKBEEZ
  );
  checks.push({
    label: "Konektor YouTube (BlinkBeez — cache 5 menit)",
    ok: ytReady,
    optional: true,
    note: ytReady
      ? "Kredensial terdeteksi."
      : "Belum diset — panel menampilkan status 'Segera hadir'.",
  });

  return checks;
}

export const PREFLIGHT_NOTES = [
  "Media Kit tersedia di /media-kit. Privasi dan disclaimer digabung di /kebijakan; kontak tetap di /#kontak.",
  "Halaman prototipe (/popbeez, /nusabeez, /blinkbeez, /e-beez, /portal-hub) sudah diproteksi dengan noindex & diblokir di robots.txt.",
  "Panel Showcase memakai cache 5 menit agar kuota YouTube Data API (100 unit per search.list) dan Meta Graph API selalu hemat.",
  "Uptime Monitor: arahkan UptimeRobot / BetterStack gratis ke https://www.hivecomp.my.id/api/health (interval 5 menit) dan hubungkan alert ke WhatsApp Anda.",
];
