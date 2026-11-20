import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import HiveIdentity from "./hive-identity";

const BRANDS = [
  { name: "PopBeez", slug: "popbeez", color: "#ff4d8d" },
  { name: "NusaBeez", slug: "nusabeez", color: "#ff453a" },
  { name: "Portal-Hub", slug: "portal-hub", color: "#38bdf8" },
  { name: "BlinkBeez", slug: "blinkbeez", color: "#a78bfa" },
  { name: "E-Beez", slug: "e-beez", color: "#34d399" },
] as const;

export default function Footer({ urls, hiveLogo = "" }: { urls: SiteSettings["urls"]; hiveLogo?: string }) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-coal/60">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="#atas" className="group flex items-center gap-2.5"><HiveIdentity logo={hiveLogo} /></a>
            <p className="mt-5 text-sm leading-relaxed text-stone-500">Lima brand media &amp; commerce, dipertemukan dalam satu pintu masuk untuk audiens dan mitra.</p>
            <Link href="/studio-logo" className="mt-5 inline-flex items-center gap-2 rounded-full border border-hive/25 bg-hive/[0.04] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-hive transition-colors hover:bg-hive/10">Studio Logo · 18 konsep <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Kanal Kami</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {BRANDS.map((b) => urls[b.slug] ? (
                <a key={b.name} href={urls[b.slug]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-stone-300 transition-colors hover:border-white/25 hover:text-white"><span className="clip-hex inline-block h-2 w-2" style={{ background: b.color }} />{b.name}</a>
              ) : (
                <span key={b.name} className="flex items-center gap-2 rounded-full border border-white/[0.06] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-stone-600"><span className="clip-hex inline-block h-2 w-2 opacity-50" style={{ background: b.color }} />{b.name}</span>
              ))}
            </div>
          </div>
          <a href="#atas" className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-300 transition-colors hover:border-hive hover:text-hive">Kembali ke Atas<ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" /></a>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-5"><p>© 2026 HiveComp — Media &amp; Commerce Group</p><Link href="/media-kit" className="transition-colors hover:text-hive">Media Kit</Link><Link href="/#kontak" className="transition-colors hover:text-hive">Kontak</Link><Link href="/kebijakan" className="transition-colors hover:text-hive">Privasi &amp; Disclaimer</Link><Link href="/admin" className="transition-colors hover:text-hive">Dashboard Admin</Link></div>
          <p>www.hivecomp.my.id</p>
        </div>
      </div>
      <div aria-hidden className="select-none overflow-hidden"><p className="text-outline translate-y-[22%] whitespace-nowrap text-center font-display text-[19vw] font-bold leading-[0.8] opacity-25">HIVECOMP</p></div>
    </footer>
  );
}
