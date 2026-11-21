"use client";

import type { CSSProperties, MouseEvent } from "react";
import { motion } from "framer-motion";
import type { SiteSettings } from "@/lib/settings";
import {
  ArrowUpRight,
  Flag,
  Globe,
  MessageCircle,
  Play,
  Popcorn,
  Share2,
  ShoppingBag,
  ThumbsUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { InstagramIcon } from "./social-icons";
import { Reveal, SectionTag } from "./reveal";

type Brand = {
  id: string;
  name: string;
  platform: string;
  desc: string;
  tags: string[];
  color: string;
  icon: LucideIcon;
  className: string;
  cta: string;
};

/* Proporsional: baris 1 tiga kartu sama lebar, baris 2 dua kartu sama lebar. */
const BRANDS: Brand[] = [
  {
    id: "popbeez",
    name: "PopBeez",
    platform: "Facebook Page",
    desc: "News card hiburan Asia — drakor, dracin, idol, manga, dan donghua — dikemas ringkas untuk dibaca sekilas lalu dibagikan.",
    tags: ["Drakor", "Dracin", "Idol", "Manga", "Donghua"],
    color: "#ff4d8d",
    icon: Popcorn,
    className: "lg:col-span-2",
    cta: "Ikuti PopBeez",
  },
  {
    id: "nusabeez",
    name: "NusaBeez",
    platform: "Facebook Page",
    desc: "News card berisi peristiwa dan kebijakan nasional pilihan, dirangkum agar bisa dipindai dalam hitungan detik.",
    tags: ["Nasional", "Terkini", "Berita"],
    color: "#ff453a",
    icon: Flag,
    className: "lg:col-span-2",
    cta: "Ikuti NusaBeez",
  },
  {
    id: "portal-hub",
    name: "Portal-Hub",
    platform: "Situs Agregator Berita",
    desc: "Menyatukan berita dari berbagai media dalam satu halaman — nasional, ekonomi, teknologi, olahraga, hiburan — diperbarui setiap hari di portal-hub.online.",
    tags: ["Agregator", "Berita", "Web"],
    color: "#38bdf8",
    icon: Globe,
    className: "lg:col-span-2",
    cta: "Buka Portal-Hub",
  },
  {
    id: "blinkbeez",
    name: "BlinkBeez",
    platform: "YouTube Shorts",
    desc: "Video pendek 60 detik berisi potongan berita dan hiburan untuk ditonton di sela waktu. Sedang disiapkan untuk tayang.",
    tags: ["Shorts", "Video", "Segera"],
    color: "#a78bfa",
    icon: Zap,
    className: "lg:col-span-3",
    cta: "Subscribe BlinkBeez",
  },
  {
    id: "e-beez",
    name: "E-Beez",
    platform: "E-Commerce",
    desc: "Etalase produk UMKM — makanan, kerajinan, dan kebutuhan harian — dengan katalog, pembayaran, dan pengiriman dalam satu alur.",
    tags: ["Marketplace", "UMKM", "COD"],
    color: "#34d399",
    icon: ShoppingBag,
    className: "lg:col-span-3",
    cta: "Kunjungi E-Beez",
  },
];

/* ---------- Preview visual (satu bingkai konsisten untuk semua brand) ---------- */

const PREVIEW_BOX =
  "relative mt-6 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30 sm:h-60";

function MiniNewsCard({
  name,
  color,
  headline,
}: {
  name: string;
  color: string;
  headline: string;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-white/10 bg-[#111113] p-3">
      <div className="flex items-center gap-2">
        <span className="clip-hex h-6 w-6 shrink-0" style={{ background: color }} />
        <p className="text-[11px] font-semibold text-stone-100">{name}</p>
        <span className="ml-auto rounded bg-white/5 px-2 py-0.5 text-[9px] font-medium text-stone-400">
          Ikuti
        </span>
      </div>
      <div
        className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-lg p-3"
        style={{ background: `linear-gradient(135deg, ${color}99, #111113)` }}
      >
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/70">
          {name} · News Card
        </span>
        <p className="mt-1 line-clamp-2 font-display text-sm font-bold uppercase leading-tight">
          {headline}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-stone-500">
        <span className="flex items-center gap-2.5">
          <ThumbsUp className="h-3 w-3" style={{ color }} />
          <MessageCircle className="h-3 w-3" />
          <Share2 className="h-3 w-3" />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-stone-600">
          News card
        </span>
      </div>
    </div>
  );
}

function MiniArticleList({ color }: { color: string }) {
  const rows = [
    { cat: "Nasional", title: "Jadwal penyaluran bantuan tahap baru diumumkan" },
    { cat: "Ekonomi", title: "Indeks saham ditutup menguat di sesi pagi" },
    { cat: "Teknologi", title: "Satelit baru dirancang jangkau desa terpencil" },
  ];
  return (
    <div className="flex w-full max-w-sm flex-col justify-center gap-2">
      {rows.map((r) => (
        <div
          key={r.title}
          className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#111113] px-3 py-2"
        >
          <span
            className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wider text-ink"
            style={{ background: color }}
          >
            {r.cat}
          </span>
          <p className="truncate text-[11px] font-medium text-stone-300">{r.title}</p>
        </div>
      ))}
      <p className="pl-1 text-right font-mono text-[8px] uppercase tracking-wider text-stone-600">
        Portal-Hub · Beranda
      </p>
    </div>
  );
}

function MiniShorts({ color }: { color: string }) {
  return (
    <div className="flex w-full max-w-sm items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="relative flex aspect-[9/14] w-20 flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-2"
          style={{
            background: `linear-gradient(160deg, ${color}${i === 1 ? "88" : "44"}, #0c0c0e 80%)`,
          }}
        >
          <span className="font-mono text-[7px] uppercase tracking-wider text-white/60">
            Shorts
          </span>
          <span className="grid h-6 w-6 place-self-center rounded-full bg-white/15 backdrop-blur">
            <Play className="h-2.5 w-2.5 fill-white text-white" />
          </span>
        </div>
      ))}
      <span className="sr-only">Pratinjau kanal Shorts</span>
    </div>
  );
}

function MiniProducts({ color }: { color: string }) {
  const items = [
    { n: "Madu Hutan", p: "Rp 85 rb" },
    { n: "Kopi Arabika", p: "Rp 65 rb" },
    { n: "Tenun Ikat", p: "Rp 350 rb" },
    { n: "VCO Murni", p: "Rp 45 rb" },
  ];
  return (
    <div className="flex w-full max-w-sm flex-col justify-center gap-2">
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => (
          <div
            key={it.n}
            className="overflow-hidden rounded-lg border border-white/10 bg-[#111113]"
          >
            <div
              className="flex aspect-square items-center justify-center"
              style={{ background: `linear-gradient(150deg, ${color}55, #0c0c0e)` }}
            >
              <span className="font-display text-base font-bold text-white/25">
                {it.n.charAt(0)}
              </span>
            </div>
            <div className="p-1.5">
              <p className="truncate text-[8px] font-medium text-stone-300">{it.n}</p>
              <p className="text-[8px] font-bold" style={{ color }}>
                {it.p}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-right font-mono text-[8px] uppercase tracking-wider text-stone-600">
        Katalog pilihan
      </p>
    </div>
  );
}

function BrandPreview({
  id,
  color,
  name,
}: {
  id: string;
  color: string;
  name: string;
}) {
  switch (id) {
    case "popbeez":
      return <MiniNewsCard name={name} color={color} headline="Drakor Terbaru Minggu Ini" />;
    case "nusabeez":
      return <MiniNewsCard name={name} color={color} headline="Berita Nasional Hari Ini" />;
    case "portal-hub":
      return <MiniArticleList color={color} />;
    case "blinkbeez":
      return <MiniShorts color={color} />;
    case "e-beez":
      return <MiniProducts color={color} />;
    default:
      return null;
  }
}

export default function Ecosystem({
  urls,
  logos,
  instagram,
}: {
  urls: SiteSettings["urls"];
  logos: SiteSettings["logos"];
  instagram: SiteSettings["instagram"];
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      id="ekosistem"
      className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionTag index="01" label="Ekosistem" />
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Lima kanal,
              <br />
              <span className="text-outline-hive">satu atap.</span>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="max-w-sm">
          <p className="text-sm leading-relaxed text-stone-400">
            Masing-masing brand punya kanal dan ritmenya sendiri. Halaman ini
            mempertemukan kelimanya, supaya siapa pun bisa mengenal lebih dulu,
            lalu langsung menuju kanal yang dicari.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {BRANDS.map((b, i) => {
          const url = urls[b.id as keyof typeof urls];
          const logoUrl = logos[b.id as keyof typeof logos];
          const igLink = (instagram as Record<string, string>)[b.id] ?? "";
          return (
            <div key={b.id} className={b.className}>
              <motion.div
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.85,
                  delay: (i % 3) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseMove={onMove}
                style={{ "--brand": b.color } as CSSProperties}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-coal p-6 transition-colors duration-500 hover:border-[color-mix(in_srgb,var(--brand)_55%,transparent)] sm:p-7"
              >
                {/* Cursor glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--brand) 12%, transparent), transparent 65%)",
                  }}
                />

                <div className="relative flex items-start justify-between">
                  {logoUrl ? (
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-transform duration-500 group-hover:scale-110">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt={`Logo ${b.name}`}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <span
                      className="clip-hex grid h-12 w-12 place-items-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background:
                          "color-mix(in srgb, var(--brand) 15%, transparent)",
                        color: "var(--brand)",
                      }}
                    >
                      <b.icon className="h-5 w-5" />
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone-600">
                    /0{i + 1}
                  </span>
                </div>

                {/* Preview visual — setiap kartu punya konten visual sendiri */}
                <div className={PREVIEW_BOX}>
                  <BrandPreview id={b.id} color={b.color} name={b.name} />
                </div>

                <div className="relative mt-auto pt-7">
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.25em]"
                    style={{ color: "var(--brand)" }}
                  >
                    {b.platform}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {b.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-400">
                    {b.desc}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {b.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500 transition-colors duration-300 group-hover:text-stone-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/cta inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink shadow-lg transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_30px_-6px_var(--brand)]"
                          style={{ background: "var(--brand)" }}
                        >
                          {b.cta}
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-600">
                          Segera dibuka
                        </span>
                      )}
                    {igLink && (
                      <a
                        href={igLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${b.name} di Instagram`}
                        title={`${b.name} di Instagram`}
                        className="grid h-12 w-12 place-items-center rounded-full border text-[var(--brand)] transition-all duration-300 hover:scale-110 hover:bg-[var(--brand)] hover:text-ink"
                        style={{ borderColor: "color-mix(in srgb, var(--brand) 45%, transparent)" }}
                      >
                        <InstagramIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
