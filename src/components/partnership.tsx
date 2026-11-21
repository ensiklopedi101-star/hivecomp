"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Handshake, Megaphone, PackageOpen, Sparkles } from "lucide-react";
import { Reveal, SectionTag } from "./reveal";

const PATHS = [
  {
    title: "Iklan & Sponsor",
    desc: "Materi kampanye yang ingin tampil berdampingan dengan kanal-kanal HiveComp.",
    icon: Megaphone,
    color: "#ffb000",
  },
  {
    title: "Kolaborasi Konten",
    desc: "Ide bersama untuk news card, video pendek, atau liputan yang relevan dengan audiens.",
    icon: Sparkles,
    color: "#ff4d8d",
  },
  {
    title: "Produk UMKM",
    desc: "Produk usaha Anda yang ingin diperkenalkan lebih luas lewat E-Beez.",
    icon: PackageOpen,
    color: "#34d399",
  },
];

export default function Partnership() {
  return (
    <section id="mitra" className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionTag index="04" label="Mitra" />
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Kerja sama,
              <br />
              <span className="text-outline-hive">satu formulir.</span>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="max-w-sm">
          <p className="text-sm leading-relaxed text-stone-400">
            Sponsor, kolaborasi, atau produk usaha — tidak perlu mencari kanal
            satu per satu. Satu pesan ke sini, lalu kami arahkan ke brand yang
            paling pas.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {PATHS.map((p, i) => (
          <motion.a
            key={p.title}
            href="#kontak"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-coal p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/25 sm:p-8"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `color-mix(in srgb, ${p.color} 25%, transparent)` }}
            />
            <span
              className="clip-hex relative grid h-12 w-12 place-items-center transition-transform duration-500 group-hover:rotate-[30deg]"
              style={{
                background: `color-mix(in srgb, ${p.color} 14%, transparent)`,
                color: p.color,
              }}
            >
              <p.icon className="h-5 w-5" />
            </span>
            <h3 className="relative mt-8 font-display text-xl font-bold sm:text-2xl">
              {p.title}
            </h3>
            <p className="relative mt-3 flex-1 text-sm leading-relaxed text-stone-400">
              {p.desc}
            </p>
            <span className="relative mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500 transition-colors group-hover:text-hive">
              Mulai diskusi
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </motion.a>
        ))}
      </div>

      <Reveal delay={0.15}>
        <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-stone-600">
          Tiga kategori di atas adalah pintu masuk paling umum. Kebutuhan lain
          tetap bisa dituliskan bebas pada formulir.
        </p>
      </Reveal>

      {/* Closing CTA band */}
      <Reveal delay={0.1}>
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-hive/25 bg-gradient-to-br from-hive/[0.14] via-hive/[0.05] to-transparent p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-hive/15 blur-[90px]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <span className="clip-hex inline-grid h-10 w-10 place-items-center bg-hive/15 text-hive">
                <Handshake className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight sm:text-3xl">
                Punya ide di luar
                <br />
                kategori-kategori ini?
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
                Tetap kirim — kami baca semuanya, tanpa perlu memilih kotak yang
                tersedia.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/media-kit"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-stone-200 transition-colors hover:border-hive hover:text-hive"
              >
                Buka Media Kit
              </a>
              <a
                href="#kontak"
                className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-hive px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                Kirim Pesan
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
