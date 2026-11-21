"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import HiveIdentity from "./hive-identity";

export default function Navbar({ hiveLogo = "" }: { hiveLogo?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: "#ekosistem", label: "Ekosistem", external: false },
    { href: "#showcase", label: "Showcase", external: false },
    { href: "#mitra", label: "Mitra", external: false },
    { href: "/media-kit", label: "Media Kit", external: false },
    { href: "/kebijakan#disclaimer", label: "Disclaimer", external: false },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#atas" className="group flex items-center gap-2.5">
          <HiveIdentity logo={hiveLogo} />
        </a>

        <div className="hidden items-center gap-7 xl:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone-400 transition-colors duration-300 hover:text-hive"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="#kontak"
            className="group hidden items-center gap-2 rounded-full bg-hive px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-hive-soft sm:inline-flex"
          >
            Kerja Sama
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-stone-200 transition-colors hover:border-hive hover:text-hive xl:hidden"
            aria-label="Buka menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-white/10 bg-ink/95 backdrop-blur-xl xl:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {[
                ...LINKS,
                { href: "#kontak", label: "Kerja Sama", external: false },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3.5 font-display text-xl font-semibold text-stone-200 transition-colors hover:bg-white/5 hover:text-hive"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
