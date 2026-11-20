"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Hexagon, Loader2, Lock, LogIn } from "lucide-react";

export default function AdminLogin({
  showDefaultHint,
}: {
  showDefaultHint: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Password salah. Coba lagi.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-hive/15 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-coal p-8 sm:p-10"
      >
        <div className="flex items-center gap-3">
          <span className="clip-hex grid h-11 w-11 place-items-center bg-hive text-ink">
            <Hexagon className="h-5 w-5" strokeWidth={2.75} />
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-[0.18em]">
              HIVE<span className="text-hive">COMP</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
              Panel Admin
            </p>
          </div>
        </div>

        <h1 className="mt-8 font-display text-2xl font-bold">Masuk ke sarang</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          Kelola tampilan landing page, URL brand, berita Portal-Hub, dan pesan
          kerja sama.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password admin"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-stone-100 placeholder:text-stone-600 transition-colors focus:border-hive/60"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-nusa/30 bg-nusa/10 px-4 py-3 text-xs text-nusa">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-hive py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-hive-soft disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Masuk <LogIn className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {showDefaultHint && (
          <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] leading-relaxed tracking-wide text-stone-500">
            Password default: <span className="text-hive">hive-admin</span> —
            segera ganti lewat environment variable{" "}
            <span className="text-stone-300">ADMIN_PASSWORD</span> di Vercel.
          </p>
        )}

        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone-400 transition-colors hover:text-hive"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Landing Page
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
