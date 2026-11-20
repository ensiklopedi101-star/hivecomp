"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-hive hover:text-hive print:hidden"
    >
      <Printer className="h-3.5 w-3.5" /> Cetak / Simpan PDF
    </button>
  );
}
