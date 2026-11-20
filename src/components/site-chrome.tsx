"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "atas", label: "Beranda" },
  { id: "ekosistem", label: "Ekosistem" },
  { id: "showcase", label: "Showcase" },
  { id: "jaringan", label: "Jaringan" },
  { id: "mitra", label: "Mitra" },
  { id: "target", label: "Target" },
  { id: "kontak", label: "Kontak" },
];

/** Scroll progress bar + desktop section rail. Anchors are handled by Lenis. */
export default function SiteChrome() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("atas");

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
      >
        <div
          className="h-full bg-hive shadow-[0_0_12px_rgba(255,176,0,0.7)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <nav
        aria-label="Navigasi section"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3.5 xl:flex"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-label={`Ke ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
            className="group flex items-center gap-2.5"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-hive">
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                active === s.id
                  ? "h-2.5 w-2.5 bg-hive shadow-[0_0_10px_rgba(255,176,0,0.6)]"
                  : "h-1.5 w-1.5 bg-white/25 group-hover:bg-hive/70"
              }`}
            />
          </a>
        ))}
      </nav>
    </>
  );
}
