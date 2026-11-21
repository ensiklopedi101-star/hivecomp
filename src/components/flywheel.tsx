"use client";

import type { ComponentType } from "react";
import { Flag, Globe, Heart, RefreshCw, ShoppingBag } from "lucide-react";
import { Reveal, SectionTag } from "./reveal";
import { YoutubeIcon } from "./social-icons";

type Node = {
  name: string;
  title: string;
  desc: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
};

/**
 * Peta jaringan brand — BUKAN diagram alur data.
 * (Portal-Hub adalah agregator mandiri, bukan sumber news card Pop/Nusa.)
 */
const NODES: Node[] = [
  {
    name: "PopBeez",
    title: "News card hiburan",
    desc: "Kanal Facebook untuk drakor, dracin, idol, manga, dan donghua, dengan sistem penerbitan yang sama seperti NusaBeez.",
    color: "#ff4d8d",
    icon: Heart,
  },
  {
    name: "NusaBeez",
    title: "News card nasional",
    desc: "Kanal Facebook untuk kabar nasional, dengan jalur produksi tersendiri di atas sistem yang sama dengan PopBeez.",
    color: "#ff453a",
    icon: Flag,
  },
  {
    name: "Portal-Hub",
    title: "Agregator berita mandiri",
    desc: "Portal berita dengan tata letak ala Yahoo dan MSN, aktif di www.portal-hub.online.",
    color: "#38bdf8",
    icon: Globe,
  },
  {
    name: "BlinkBeez",
    title: "Kanal YouTube Shorts",
    desc: "Video pendek 60 detik berisi potongan berita dan hiburan, sedang disiapkan untuk tayang.",
    color: "#a78bfa",
    icon: YoutubeIcon,
  },
  {
    name: "E-Beez",
    title: "Marketplace",
    desc: "Marketplace dengan sistemnya sendiri, diakses lewat subdomain E-Beez.",
    color: "#34d399",
    icon: ShoppingBag,
  },
];

function OrbitDiagram() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Rotating dashed rings */}
      <div className="absolute inset-0 animate-rotate-slow rounded-full border border-dashed border-hive/30" />
      <div className="absolute inset-10 animate-rotate-rev rounded-full border border-white/[0.07]" />

      {/* Conic sweep — signature "radar" light of the hive theme */}
      <div
        aria-hidden
        className="absolute inset-0 animate-rotate-slow rounded-full opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,176,0,0.10) 40deg, transparent 90deg)",
          maskImage: "radial-gradient(circle, transparent 31%, black 32%, black 47%, transparent 48%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 31%, black 32%, black 47%, transparent 48%)",
        }}
      />

      {/* Soft core glow */}
      <div className="absolute inset-24 rounded-full bg-hive/[0.05] blur-2xl" />

      {/* Center hive core with pulse */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-hive/20 [animation-duration:3s] [animation-iteration-count:4]"
          style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
        />
        <div className="clip-hex relative grid h-32 w-32 animate-float place-items-center bg-gradient-to-br from-hive to-hive-soft p-[2px] sm:h-36 sm:w-36">
          <div className="clip-hex grid h-full w-full place-items-center bg-ink">
            <div className="text-center">
              <p className="font-display text-xl font-bold tracking-[0.2em] text-hive">
                HIVE
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.35em] text-stone-500">
                comp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orbiting nodes — staggered float keeps them alive */}
      {NODES.map((n, i) => {
        const angle = (Math.PI / 180) * (-90 + i * 72);
        const x = 50 + 46 * Math.cos(angle);
        const y = 50 + 46 * Math.sin(angle);
        return (
          <div
            key={n.name}
            className="absolute flex animate-float flex-col items-center gap-2"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.9}s`,
              animationDuration: "5.5s",
            }}
          >
            <div
              className="relative grid h-14 w-14 place-items-center rounded-full border bg-ink transition-transform duration-300 hover:scale-110 sm:h-16 sm:w-16"
              style={{
                borderColor: `color-mix(in srgb, ${n.color} 55%, transparent)`,
                boxShadow: `0 0 28px color-mix(in srgb, ${n.color} 25%, transparent)`,
                color: n.color,
              }}
            >
              <n.icon className="h-5 w-5" />
              <span
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full font-mono text-[9px] font-medium text-ink"
                style={{ background: n.color }}
              >
                {i + 1}
              </span>
            </div>
            <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 sm:text-[10px]">
              {n.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Flywheel() {
  return (
    <section id="jaringan" className="relative border-y border-white/10 bg-coal/40">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="max-w-2xl">
          <SectionTag index="03" label="Jaringan Brand" />
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Peta brand,
              <br />
              <span className="text-hive">satu jaringan.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
              Lima kanal dalam satu naungan. Tiap produk berjalan dengan
              sistemnya sendiri; yang kami satukan adalah{" "}
              <strong className="text-stone-200">identitas, standar kerja, dan
              pintu masuk audiens</strong>.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28">
            <OrbitDiagram />
          </Reveal>

          <div>
            {NODES.map((n, i) => (
              <Reveal key={n.name} delay={i * 0.06}>
                <div className="group flex gap-5 border-b border-white/10 py-7 first:pt-0">
                  <span className="font-mono text-xs text-stone-600">0{i + 1}</span>
                  <span
                    className="clip-hex grid h-11 w-11 shrink-0 place-items-center transition-transform duration-500 group-hover:rotate-[30deg]"
                    style={{
                      background: `color-mix(in srgb, ${n.color} 14%, transparent)`,
                      color: n.color,
                    }}
                  >
                    <n.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: n.color }}
                    >
                      {n.name}
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-bold sm:text-2xl">
                      {n.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-400">
                      {n.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="mt-8 flex items-start gap-4 rounded-2xl border border-hive/25 bg-hive/[0.06] p-5">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 animate-rotate-slow text-hive" />
                <p className="text-sm leading-relaxed text-stone-300">
                  <span className="font-semibold text-hive">Satu halaman, semua pintu masuk — </span>
                  pengunjung cukup datang ke hivecomp.my.id untuk menemukan
                  seluruh kanal, lalu diarahkan ke produk yang dicari.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
