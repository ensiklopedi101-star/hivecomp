"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import type { SiteSettings } from "@/lib/settings";
import { Reveal, SectionTag } from "./reveal";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 2200, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = Math.round(v).toLocaleString("id-ID") + suffix;
      }
    });
    return unsub;
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/** Slim one-band target strip — editable from /admin. */
export default function Stats({
  targets,
}: {
  targets: SiteSettings["targets"];
}) {
  return (
    <section
      id="target"
      className="relative border-y border-white/10 bg-coal/40"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTag index="05" label="Target" />
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                Kerangka 12 bulan pertama
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-xs leading-relaxed text-stone-500">
              Angka bawaan adalah{" "}
              <span className="text-hive">template ilustrasi</span> — ganti lewat
              /admin bila ingin dipakai di produksi.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {targets.map((t) => (
              <div key={t.label} className="flex items-baseline gap-3 bg-coal px-6 py-5">
                <p className="font-display text-3xl font-bold tracking-tight text-hive">
                  <Counter to={t.to} suffix={t.suffix} />
                </p>
                <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-stone-500">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
