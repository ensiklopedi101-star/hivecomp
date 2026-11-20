"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Hexagon,
  MapPin,
  Play,
  Star,
} from "lucide-react";
import { BRANDS, BRAND_SLUGS, E_BEEZ_PRODUCTS, type BrandInfo } from "@/lib/brands";
import {
  formatCount,
  pseudoViews,
  type ArticleDTO,
} from "@/lib/shared";
import NewsCard from "./news-card";
import { YoutubeIcon } from "./social-icons";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function ExternalCta({
  url,
  label,
  color,
}: {
  url: string;
  label: string;
  color: string;
}) {
  if (!url) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-3 rounded-full border border-white/10 px-7 py-4 font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
        Tautan segera hadir
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 rounded-full px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:scale-[1.03]"
      style={{ background: color }}
    >
      {label}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export default function BrandPage({
  brand,
  url,
  articles,
}: {
  brand: BrandInfo;
  url: string;
  articles: ArticleDTO[];
}) {
  const others = BRAND_SLUGS.filter((s) => s !== brand.slug);

  return (
    <main className="relative min-h-svh overflow-hidden">
      {/* Brand ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[52rem] max-w-[95vw] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: `color-mix(in srgb, ${brand.color} 16%, transparent)` }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="clip-hex grid h-9 w-9 place-items-center bg-hive text-ink transition-transform duration-500 group-hover:rotate-[30deg]">
              <Hexagon className="h-4 w-4" strokeWidth={2.75} />
            </span>
            <span className="font-display text-base font-bold tracking-[0.18em]">
              HIVE<span className="text-hive">COMP</span>
            </span>
          </Link>
          <Link
            href="/#ekosistem"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-hive"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Semua Brand
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-mono text-[11px] uppercase tracking-[0.35em]"
          style={{ color: brand.color }}
        >
          {brand.platform} · Bagian dari HiveComp
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-[clamp(3.2rem,10vw,8rem)] font-bold uppercase leading-[0.95] tracking-tight"
          style={{ color: brand.color }}
        >
          {brand.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-5 max-w-2xl font-display text-xl font-semibold text-stone-100 sm:text-2xl"
        >
          {brand.tagline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base"
        >
          {brand.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <ExternalCta url={url} label={brand.ctaLabel} color={brand.color} />
          <div className="flex flex-wrap gap-2">
            {brand.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Showcase */}
      <section className="relative z-10 border-t border-white/10 bg-coal/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          {/* PopBeez & NusaBeez — news cards fed by Portal-Hub */}
          {brand.category && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  Contoh news card
                </h2>
                <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-stone-500">
                  PROTOTIPE — contoh tata letak kartu, bukan postingan dari akun
                  {" "}{brand.name} dan bukan data dari backend Anda
                </p>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 6).map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
                  >
                    <NewsCard article={a} brandName={brand.name} brandColor={brand.color} />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* BlinkBeez — vertical shorts */}
          {brand.slug === "blinkbeez" && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  Shorts <span style={{ color: brand.color }}>terbaru</span>
                </h2>
                <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-stone-500">
                  PROTOTIPE tata letak — BlinkBeez belum memiliki kanal
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {articles.slice(0, 4).map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10"
                  >
                    {a.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(160deg, color-mix(in srgb, ${brand.color} 45%, #0c0c0e), #0c0c0e)`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-nusa px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-white">
                      <YoutubeIcon className="h-3 w-3" /> Shorts
                    </span>
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
                        {a.title}
                      </p>
                      <p className="mt-2 font-mono text-[10px] text-stone-400">
                        {formatCount(pseudoViews(a.id) * 13)}× ditonton
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* E-Beez — local products */}
          {brand.slug === "e-beez" && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  Produk <span style={{ color: brand.color }}>unggulan</span>
                </h2>
                <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-stone-500">
                  PROTOTIPE katalog — bukan produk dari E-Beez Anda
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {E_BEEZ_PRODUCTS.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111113] transition-colors duration-500 hover:border-ebeez/50"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-ebeez px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-ink">
                        Lokal
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-1 text-sm font-semibold text-stone-100">{p.name}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">{p.unit}</p>
                      <p className="mt-2 font-display text-lg font-bold text-ebeez">
                        {rupiah.format(p.price)}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-hive text-hive" /> {p.rating}
                        </span>
                        <span>{p.sold} terjual</span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                        <MapPin className="h-3 w-3 text-ebeez" /> {p.location}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-8 rounded-2xl border border-ebeez/25 bg-ebeez/[0.06] p-5 text-sm leading-relaxed text-stone-300">
                <span className="font-semibold text-ebeez">Punya produk UMKM?</span>{" "}
                Titipkan di E-Beez dan dapatkan promosi gratis di seluruh kanal
                HiveComp — inilah kekuatan membeli dari tetangga sendiri.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Cross-promotion — prototipe, bukan produk resmi */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
          Jelajahi lebah lainnya
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {others.map((slug) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
            >
              <span
                className="clip-hex inline-block h-2 w-2"
                style={{ background: BRANDS[slug].color }}
              />
              {BRANDS[slug].name}
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600 sm:flex-row sm:items-center">
          <p>© 2026 HiveComp — Media &amp; Commerce Group</p>
          <Link href="/" className="transition-colors hover:text-hive">
            hivecomp.id
          </Link>
        </div>
      </section>
    </main>
  );
}
