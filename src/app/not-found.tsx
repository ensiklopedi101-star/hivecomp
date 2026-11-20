import Link from "next/link";
import { ArrowLeft, FileText, Hexagon } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-5 text-stone-100">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-hive/15 blur-[130px]" />

      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2.5">
          <span className="clip-hex grid h-10 w-10 place-items-center bg-hive text-ink">
            <Hexagon className="h-4.5 w-4.5" strokeWidth={2.75} />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.18em]">
            HIVE<span className="text-hive">COMP</span>
          </span>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
          ( 404 ) — Halaman Tidak Ditemukan
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.98] tracking-tight sm:text-6xl">
          Jalur ini
          <br />
          <span className="text-outline-hive">di luar sarang.</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-stone-400 sm:text-base">
          Tautan yang Anda tuju tidak tersedia atau sudah dipindahkan. Kembali ke
          halaman utama untuk melihat seluruh kanal dan produk HiveComp.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full bg-hive px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Ke Beranda
          </Link>
          <Link
            href="/media-kit"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-hive hover:text-hive"
          >
            <FileText className="h-4 w-4" /> Media Kit
          </Link>
        </div>
      </div>
    </main>
  );
}
