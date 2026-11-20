import { Hexagon } from "lucide-react";

const BRANDS = ["POPBEEZ", "NUSABEEZ", "PORTAL-HUB", "BLINKBEEZ", "E-BEEZ"];

export default function Marquee() {
  return (
    <div className="marquee-paused relative overflow-hidden border-y border-white/10 bg-coal py-5">
      <div className="marquee-track flex w-max animate-marquee items-center gap-10">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
            {BRANDS.map((b) => (
              <span key={`${copy}-${b}`} className="flex items-center gap-10">
                <span className="font-display text-2xl font-bold tracking-[0.14em] text-stone-600 transition-colors duration-300 hover:text-hive sm:text-3xl">
                  {b}
                </span>
                <Hexagon className="h-3.5 w-3.5 text-hive/50" fill="currentColor" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
