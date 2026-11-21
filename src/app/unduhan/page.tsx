import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, FileArchive, Image as ImageIcon, Info } from "lucide-react";
import { getSettings } from "@/lib/settings";
import HiveIdentity from "@/components/hive-identity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pusat Unduhan — HiveComp",
  description: "Unduh banner Facebook Page, foto profil, logo, dan paket proyek HiveComp.",
  robots: { index: false, follow: false },
};

const COVERS = [
  {
    id: "popbeez",
    name: "PopBeez",
    concept: "Pop Spotlight",
    color: "#F54B8D",
  },
  {
    id: "nusabeez",
    name: "NusaBeez",
    concept: "Front Page",
    color: "#EF4B42",
  },
] as const;

const PROFILES = [
  {
    id: "popbeez",
    name: "PopBeez",
    color: "#F54B8D",
    variants: [
      { id: "a-white", name: "Pop White", note: "Latar putih, logo pink — bersih & kontras", rec: true },
      { id: "b-solid", name: "Pop Solid", note: "Pink-ungu penuh, tegas di ukuran kecil" },
      { id: "c-cardstack", name: "Card Stack", note: "Kartu miring seperti di banner" },
    ],
  },
  {
    id: "nusabeez",
    name: "NusaBeez",
    color: "#EF4B42",
    variants: [
      { id: "a-headline", name: "Headline Glow", note: "Gelap & cincin merah, senada banner" },
      { id: "b-solid", name: "Solid Red", note: "Merah penuh, logo putih", rec: true },
      { id: "c-frontpage", name: "Front Page", note: "Lembar koran krem di kartu gelap" },
    ],
  },
] as const;

const PACKAGES = [
  {
    href: "/profil/hivecomp-facebook-profil.zip",
    title: "Semua foto profil (ZIP)",
    desc: "6 varian foto profil PopBeez & NusaBeez (PNG 1080px + SVG), lembar perbandingan, dan panduan upload.",
  },
  {
    href: "/covers/hivecomp-facebook-covers.zip",
    title: "Semua banner Facebook (ZIP)",
    desc: "PNG, JPG, SVG, foto profil, pratinjau, dan panduan upload untuk PopBeez & NusaBeez.",
  },
  {
    href: "/logos/hivecomp-18-logo-concepts.zip",
    title: "Semua konsep logo (ZIP)",
    desc: "18 konsep logo SVG/PNG, termasuk enam logo final yang dipakai situs.",
  },
  {
    href: "/hivecomp-github-vercel.zip",
    title: "Paket proyek GitHub & Vercel (ZIP)",
    desc: "Kode sumber lengkap siap diunggah ke GitHub dan dideploy ke Vercel. Tanpa file .env.",
  },
];

function DownloadButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      download
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-full bg-hive px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-hive-soft"
          : "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-stone-200 transition-colors hover:border-hive hover:text-hive"
      }
    >
      <Download className="h-3.5 w-3.5" /> {label}
    </a>
  );
}

export default async function DownloadsPage() {
  const site = await getSettings();

  return (
    <main id="konten" className="min-h-svh bg-ink text-stone-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-[72px] max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="HiveComp — beranda">
            <HiveIdentity logo={site.hiveLogo} />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-stone-400 transition-colors hover:text-hive">
            <ArrowLeft className="h-3.5 w-3.5" /> Beranda
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-hive">Pusat unduhan</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Banner, logo &amp; <span className="text-hive">paket proyek</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400">
          Semua file desain dan paket proyek dalam satu tempat. Pratinjau tampil langsung di halaman ini.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-coal p-4 text-[13px] leading-relaxed text-stone-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-hive" />
          <p>
            Bila tombol <strong className="text-stone-200">Unduh</strong> tidak bereaksi di dalam panel Preview, pakai{" "}
            <strong className="text-stone-200">Buka di tab baru</strong>, lalu simpan dari sana (klik kanan → <em>Simpan gambar</em>,
            atau tekan lama di HP). Setelah situs dideploy ke Vercel, file yang sama tersedia permanen di{" "}
            <code className="font-mono text-hive">www.hivecomp.my.id/covers/…</code>.
          </p>
        </div>

        {/* ---------------- Facebook covers ---------------- */}
        <section aria-labelledby="judul-banner" className="mt-12">
          <h2 id="judul-banner" className="flex items-center gap-2 font-display text-xl font-semibold">
            <ImageIcon className="h-5 w-5 text-hive" /> Banner Facebook Page
          </h2>
          <p className="mt-1 text-xs text-stone-500">Ukuran 1640×624 px — ukuran unggah resmi sampul Facebook Page.</p>

          <div className="mt-6 space-y-8">
            {COVERS.map((c) => {
              const base = `/covers/${c.id}-facebook-cover`;
              return (
                <article key={c.id} className="overflow-hidden rounded-3xl border border-white/10 bg-coal">
                  <a href={`${base}.png`} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${base}.png`}
                      alt={`Banner Facebook ${c.name} — konsep ${c.concept}`}
                      width={1640}
                      height={624}
                      className="h-auto w-full"
                    />
                  </a>
                  <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-display text-lg font-semibold">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name} <span className="font-normal text-stone-500">· {c.concept}</span>
                      </p>
                      <p className="mt-1 text-xs text-stone-500">PNG disarankan untuk upload (teks tetap tajam).</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DownloadButton href={`${base}.png`} label="Unduh PNG" primary />
                      <DownloadButton href={`${base}.jpg`} label="JPG ringan" />
                      <DownloadButton href={`${base}.svg`} label="SVG (edit)" />
                      <a
                        href={`#profil-${c.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-stone-200 transition-colors hover:border-hive hover:text-hive"
                      >
                        Pilihan foto profil ↓
                      </a>
                      <a
                        href={`${base}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-stone-200 transition-colors hover:border-hive hover:text-hive"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Buka di tab baru
                      </a>
                    </div>
                  </div>
                  <details className="border-t border-white/10 px-5 py-4 sm:px-6">
                    <summary className="cursor-pointer text-xs text-stone-400 hover:text-hive">
                      Lihat pratinjau di desktop &amp; HP + panduan area aman
                    </summary>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/covers/${c.id}-preview.png`}
                      alt={`Pratinjau banner ${c.name} di desktop dan HP`}
                      loading="lazy"
                      className="mt-4 h-auto w-full rounded-xl"
                    />
                  </details>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------------- Facebook profile photos ---------------- */}
        <section id="profil" aria-labelledby="judul-profil" className="mt-14 scroll-mt-8">
          <h2 id="judul-profil" className="flex items-center gap-2 font-display text-xl font-semibold">
            <ImageIcon className="h-5 w-5 text-hive" /> Foto profil Facebook Page
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Tiga arah desain per Page. Unggah file persegi 1080×1080 px — Facebook memotongnya menjadi lingkaran.
          </p>

          <div className="mt-6 space-y-8">
            {PROFILES.map((p) => (
              <article key={p.id} id={`profil-${p.id}`} className="scroll-mt-8 overflow-hidden rounded-3xl border border-white/10 bg-coal">
                <a href={`/profil/${p.id}-profil-pilihan.png`} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/profil/${p.id}-profil-pilihan.png`}
                    alt={`Lembar perbandingan tiga foto profil ${p.name}`}
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </a>
                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
                  {p.variants.map((v) => {
                    const base = `/profil/${p.id}-profil-${v.id}`;
                    return (
                      <div key={v.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${base}.png`}
                            alt={`${p.name} — ${v.name}`}
                            width={96}
                            height={96}
                            loading="lazy"
                            className="h-24 w-24 shrink-0 rounded-full border border-white/10"
                          />
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 font-display text-base font-semibold">
                              {v.name}
                              {"rec" in v && v.rec && (
                                <span
                                  className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink"
                                  style={{ background: p.color }}
                                >
                                  Rekomendasi
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-stone-500">{v.note}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <DownloadButton href={`${base}.png`} label="Unduh PNG" primary />
                          <DownloadButton href={`${base}.svg`} label="SVG" />
                          <a
                            href={`${base}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-stone-200 transition-colors hover:border-hive hover:text-hive"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Tab baru
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- Packages ---------------- */}
        <section aria-labelledby="judul-paket" className="mt-14">
          <h2 id="judul-paket" className="flex items-center gap-2 font-display text-xl font-semibold">
            <FileArchive className="h-5 w-5 text-hive" /> Paket ZIP
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((p) => (
              <div key={p.href} className="flex flex-col rounded-2xl border border-white/10 bg-coal p-5">
                <p className="font-display text-base font-semibold">{p.title}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-500">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <DownloadButton href={p.href} label="Unduh" primary />
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-stone-300 transition-colors hover:border-hive hover:text-hive"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Tab baru
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
