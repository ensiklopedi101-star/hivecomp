"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import HexCanvas from "./hex-canvas";

const line: Variants = {
  hidden: { y: "112%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 1.1, delay: 0.2 + i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Only figures that follow directly from the brief — no invented metrics.
const HERO_STATS = [
  { value: "05", label: "Brand dalam grup" },
  { value: "02", label: "Produk beroperasi" },
  { value: "01", label: "Infrastruktur bersama" },
  { value: "01", label: "Pintu masuk audiens" },
];

export default function Hero({
  hero,
  whatsapp = "",
}: {
  hero: SiteSettings["hero"];
  whatsapp?: string;
}) {
  const waUrl = buildWhatsAppUrl(
    whatsapp,
    "Halo HiveComp, saya ingin mendiskusikan kerja sama.",
  );

  return (
    <section id="atas" className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Interactive honeycomb field */}
      <HexCanvas className="absolute inset-0 h-full w-full opacity-80" />

      {/* Vignette + glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_55%_at_50%_42%,transparent_0%,#050505_80%)]" />
      <div className="pointer-events-none absolute -top-44 left-1/2 h-96 w-[44rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-hive/15 blur-[130px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-14 pt-36 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-9 inline-flex w-fit items-center gap-3 rounded-full border border-hive/25 bg-hive/[0.06] px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-blink-dot rounded-full bg-hive" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-hive sm:text-[11px]">
            {hero.kicker}
          </span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.9rem,9.2vw,7.75rem)] font-bold uppercase leading-[0.94] tracking-tight">
          <span className="block overflow-hidden pb-1">
            <motion.span
              className="block"
              variants={line}
              custom={0}
              initial="hidden"
              animate="show"
            >
              {hero.line1}
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span
              className="text-outline block"
              variants={line}
              custom={1}
              initial="hidden"
              animate="show"
            >
              {hero.line2}
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="block"
              variants={line}
              custom={2}
              initial="hidden"
              animate="show"
            >
              {hero.line3a} <span className="text-hive">{hero.line3b}</span>
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-stone-400 sm:text-lg"
        >
          {hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#ekosistem"
            className="group inline-flex items-center gap-3 rounded-full bg-hive px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-hive-soft"
          >
            Jelajahi Ekosistem
            <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
          <a
            href="#kontak"
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 font-mono text-xs uppercase tracking-[0.2em] text-stone-200 transition-colors duration-300 hover:border-hive hover:text-hive"
          >
            Ajukan Kerja Sama
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full border border-ebeez/40 bg-ebeez/10 px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ebeez transition-colors duration-300 hover:bg-ebeez hover:text-ink"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#ekosistem"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-40 right-6 z-10 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-stone-600 transition-colors hover:text-hive lg:flex"
      >
        Gulir <ArrowDown className="h-3 w-3" />
      </motion.a>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="relative z-10 border-t border-white/10 bg-ink/40 backdrop-blur-sm"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 sm:px-8 md:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="px-4 py-6 first:pl-0">
              <p className="font-display text-2xl font-bold text-hive sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
