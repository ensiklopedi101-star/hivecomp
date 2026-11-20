import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Flag,
  Globe,
  Handshake,
  Hexagon,
  Megaphone,
  MessageCircle,
  PackageOpen,
  Popcorn,
  ShoppingBag,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BrandSlug } from "@/lib/brands";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Kit & Kemitraan — HiveComp",
  description:
    "Profil grup HiveComp, daftar kanal (PopBeez, NusaBeez, Portal-Hub, BlinkBeez, E-Beez), format kolaborasi, dan alur kerja sama untuk sponsor & mitra.",
};

type KitBrand = {
  slug: BrandSlug;
  name: string;
  platform: string;
  color: string;
  icon: LucideIcon;
  status: string;
  focus: string;
  formats: string[];
};

const KIT_BRANDS: KitBrand[] = [
  {
    slug: "popbeez",
    name: "PopBeez",
    platform: "Facebook Page",
    color: "#ff4d8d",
    icon: Popcorn,
    status: "Aktif · Backend bersama NusaBeez",
    focus: "News card hiburan Asia (drakor, dracin, idol group, manga, donghua) untuk audiens komunitas penggemar.",
    formats: ["News Card Visual", "Single / Carousel Post", "Pinned Brand Mention"],
  },
  {
    slug: "nusabeez",
    name: "NusaBeez",
    platform: "Facebook Page",
    color: "#ff453a",
    icon: Flag,
    status: "Aktif · Backend bersama PopBeez",
    focus: "News card berita nasional & topik publik terkini yang dikemas ringkas dan mudah dibagikan.",
    formats: ["News Card Nasional", "Infografik Ringkas", "Sponsored Card"],
  },
  {
    slug: "portal-hub",
    name: "Portal-Hub",
    platform: "Web News Aggregator",
    color: "#38bdf8",
    icon: Globe,
    status: "Beroperasi · www.portal-hub.online",
    focus: "Portal agregator berita mandiri lintas kategori (Nasional, Hiburan, Ekonomi, Olahraga, Teknologi, Gaya Hidup).",
    formats: ["Artikel / Advertorial", "Penempatan Banner", "Sorotan Kategori"],
  },
  {
    slug: "blinkbeez",
    name: "BlinkBeez",
    platform: "YouTube Shorts",
    color: "#a78bfa",
    icon: Zap,
    status: "Dalam persiapan",
    focus: "Kanal video vertikal berdurasi singkat (≤60 detik) untuk merangkum topik populer secara visual.",
    formats: ["Short Video 60 Detik", "Brand Bumper / Callout", "Pinned Link"],
  },
  {
    slug: "e-beez",
    name: "E-Beez",
    platform: "E-Commerce",
    color: "#34d399",
    icon: ShoppingBag,
    status: "Beroperasi · Subdomain mandiri",
    focus: "Marketplace produk pilihan dan mitra usaha dengan sistem katalog serta pemesanan tersendiri.",
    formats: ["Listing Produk Mitra", "Etalase Unggulan", "Bundling Kampanye"],
  },
];

const PACKAGES = [
  {
    title: "Iklan & Sponsor Kanal",
    icon: Megaphone,
    color: "#ffb000",
    points: [
      "Penempatan brand pada news card PopBeez atau NusaBeez",
      "Penayangan artikel/sorotan di Portal-Hub",
      "Materi visual disesuaikan dengan gaya editorial kanal agar tetap organik",
    ],
  },
  {
    title: "Kolaborasi Konten Terpadu",
    icon: Sparkles,
    color: "#ff4d8d",
    points: [
      "Satu topik kampanye diadaptasi lintas format (kartu visual, artikel, atau video pendek)",
      "Jadwal tayang terkoordinasi melalui satu pintu komunikasi",
      "Cocok untuk peluncuran produk, event, atau kampanye kesadaran merek",
    ],
  },
  {
    title: "Kemitraan Produk di E-Beez",
    icon: PackageOpen,
    color: "#34d399",
    points: [
      "Pendaftaran produk usaha ke katalog E-Beez",
      "Dukungan eksposur silang dari jaringan media HiveComp",
      "Jalur langsung dari atensi audiens menuju transaksi",
    ],
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Kirim Brief",
    desc: "Sampaikan tujuan kampanye, produk, serta kanal yang diminati melalui formulir atau WhatsApp.",
  },
  {
    step: "02",
    title: "Rekomendasi Format",
    desc: "Tim kami menyusun opsi penempatan dan jadwal yang paling relevan dengan audiens tiap brand.",
  },
  {
    step: "03",
    title: "Produksi & Kurasi",
    desc: "Materi disiapkan mengikuti standar visual masing-masing kanal dan dikonfirmasi sebelum tayang.",
  },
  {
    step: "04",
    title: "Tayang & Ringkasan",
    desc: "Konten diterbitkan sesuai jadwal beserta tautan bukti tayang untuk dokumentasi mitra.",
  },
];

export default async function MediaKitPage() {
  const s = await getSettings();
  const waUrl = buildWhatsAppUrl(
    s.contact.whatsapp,
    "Halo HiveComp, saya telah membaca Media Kit dan ingin mendiskusikan kerja sama.",
  );

  return (
    <main className="min-h-svh bg-ink text-stone-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 backdrop-blur-xl print:static print:border-b print:bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="clip-hex grid h-9 w-9 place-items-center bg-hive text-ink">
              <Hexagon className="h-4 w-4" strokeWidth={2.75} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-[0.18em]">
                HIVE<span className="text-hive">COMP</span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-stone-500">
                Media Kit
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <PrintButton />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-hive hover:text-hive print:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Beranda
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        {/* Hero */}
        <div className="rounded-3xl border border-white/10 bg-coal p-8 sm:p-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
            ( Media Kit &amp; Profil Kemitraan )
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-6xl">
            Lima Kanal.
            <br />
            <span className="text-hive">Satu Meja Kolaborasi.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
            {s.hero.description} Dokumen ringkas ini merangkum karakter tiap
            unit di bawah HiveComp serta bentuk kerja sama yang tersedia bagi
            sponsor, pengiklan, dan mitra produk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
            <Link
              href="/#kontak"
              className="inline-flex items-center gap-2.5 rounded-full bg-hive px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft"
            >
              Ajukan Kerja Sama <ArrowUpRight className="h-4 w-4" />
            </Link>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-ebeez/40 bg-ebeez/10 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ebeez transition-colors hover:bg-ebeez hover:text-ink"
              >
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* 5 Brand Profiles */}
        <section className="mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
            01 — Profil Kanal &amp; Unit
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Ekosistem HiveComp
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {KIT_BRANDS.map((b) => {
              const logoUrl = s.logos[b.slug];
              const targetUrl = s.urls[b.slug];
              return (
                <div
                  key={b.slug}
                  className="flex flex-col justify-between rounded-3xl border border-white/10 bg-coal p-6 sm:p-7"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {logoUrl ? (
                          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoUrl}
                              alt={`Logo ${b.name}`}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        ) : (
                          <span
                            className="clip-hex grid h-12 w-12 shrink-0 place-items-center"
                            style={{
                              background: `color-mix(in srgb, ${b.color} 16%, transparent)`,
                              color: b.color,
                            }}
                          >
                            <b.icon className="h-5 w-5" />
                          </span>
                        )}
                        <div>
                          <p
                            className="font-mono text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: b.color }}
                          >
                            {b.platform}
                          </p>
                          <h3 className="font-display text-2xl font-bold">
                            {b.name}
                          </h3>
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-stone-400">
                        {b.status}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-stone-400">
                      {b.focus}
                    </p>

                    <div className="mt-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone-500">
                        Format yang didukung
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {b.formats.map((f) => (
                          <span
                            key={f}
                            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 font-mono text-[10px] text-stone-300"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {targetUrl && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors hover:underline"
                        style={{ color: b.color }}
                      >
                        {targetUrl.replace(/^https?:\/\//, "")}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Collaboration Options */}
        <section className="mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
            02 — Skema Kemitraan
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Bentuk Kerja Sama
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.title}
                className="rounded-3xl border border-white/10 bg-coal p-7"
              >
                <span
                  className="clip-hex grid h-11 w-11 place-items-center"
                  style={{
                    background: `color-mix(in srgb, ${pkg.color} 15%, transparent)`,
                    color: pkg.color,
                  }}
                >
                  <pkg.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">
                  {pkg.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {pkg.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-400"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: pkg.color }}
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
            03 — Alur Kolaborasi
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Cara Kami Bekerja
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((w) => (
              <div
                key={w.step}
                className="rounded-2xl border border-white/10 bg-coal p-6"
              >
                <span className="font-mono text-xs text-hive">{w.step}</span>
                <h3 className="mt-2 font-display text-lg font-bold">
                  {w.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-400">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-16 rounded-3xl border border-hive/30 bg-gradient-to-br from-hive/[0.14] via-hive/[0.04] to-transparent p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="clip-hex inline-grid h-10 w-10 place-items-center bg-hive/20 text-hive">
                <Handshake className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold uppercase sm:text-3xl">
                Diskusikan Kampanye Anda
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-300">
                Data jangkauan terkini per kanal disampaikan secara transparan
                saat diskusi sesuai kebutuhan kampanye Anda.
              </p>
              {(s.contact.email || s.contact.whatsapp) && (
                <p className="mt-3 font-mono text-xs text-hive">
                  {[s.contact.email, s.contact.whatsapp]
                    .filter(Boolean)
                    .join("  ·  ")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 print:hidden">
              <Link
                href="/#kontak"
                className="inline-flex items-center gap-2.5 rounded-full bg-hive px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft"
              >
                Isi Formulir <ArrowUpRight className="h-4 w-4" />
              </Link>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-stone-100 transition-colors hover:border-ebeez hover:text-ebeez"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
