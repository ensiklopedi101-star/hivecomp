"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Flame,
  Globe,
  Hexagon,
  Loader2,
  Mail,
  Search,
  Sun,
} from "lucide-react";
import { BRANDS } from "@/lib/brands";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  formatCount,
  pseudoViews,
  type ArticleDTO,
} from "@/lib/shared";

const HOME = "Beranda";

function CategoryChip({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#0284c7";
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}
    >
      {category}
    </span>
  );
}

function ArticleCard({ a }: { a: ArticleDTO }) {
  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {a.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-sky-100 to-slate-200">
            <Globe className="h-8 w-8 text-sky-300" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <CategoryChip category={a.category} />
        <h3 className="mt-2.5 line-clamp-2 font-display text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-sky-700">
          {a.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
          {a.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-slate-400">
          <span className="truncate font-medium">{a.source}</span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            <Eye className="h-3 w-3" /> {formatCount(pseudoViews(a.id))}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">{a.dateLabel}</p>
      </div>
    </article>
  );
}

export default function PortalApp({
  articles,
  today,
}: {
  articles: ArticleDTO[];
  today: string;
}) {
  const [category, setCategory] = useState<string>(HOME);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [nlState, setNlState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (category === HOME || a.category === category) &&
        (!q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)),
    );
  }, [articles, category, query]);

  const browsing = category === HOME && !query.trim();
  const featured = filtered[0];
  const trending = useMemo(
    () => [...articles].sort((a, b) => pseudoViews(b.id) - pseudoViews(a.id)).slice(0, 5),
    [articles],
  );
  const ticker = articles.slice(0, 6);

  const subscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (nlState === "busy" || !email.includes("@")) return;
    setNlState("busy");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Pelanggan Newsletter",
          contact: email,
          interest: "Lainnya",
          message: "Berlangganan ringkasan harian Portal-Hub",
        }),
      });
      if (!res.ok) throw new Error();
      setNlState("sent");
    } catch {
      setNlState("error");
    }
  };

  return (
    <div className="min-h-svh bg-[#f4f5f7] font-sans text-slate-900">
      {/* Utility bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[11px] text-slate-500 sm:px-8">
          <p className="truncate">{today}</p>
          <p className="hidden items-center gap-1.5 sm:flex">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            Cuaca hari ini · 29°C Cerah Berawan
          </p>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-hive"
          >
            <Hexagon className="h-3 w-3" /> Bagian dari HiveComp
          </Link>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5 sm:px-8">
          <button
            onClick={() => {
              setCategory(HOME);
              setQuery("");
            }}
            className="flex items-center gap-2.5"
          >
            <span className="clip-hex grid h-9 w-9 place-items-center bg-sky-600 text-white">
              <Globe className="h-4 w-4" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              PORTAL<span className="text-sky-600">-HUB</span>
            </span>
          </button>
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari berita, topik, atau kata kunci…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>
        <nav className="mx-auto max-w-7xl overflow-x-auto px-5 pb-3 sm:px-8">
          <div className="flex w-max items-center gap-1.5">
            {[HOME, ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                  category === c
                    ? "bg-sky-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Breaking ticker */}
      <div className="marquee-paused overflow-hidden bg-slate-900 py-2.5 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 sm:px-8">
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">
            <Flame className="h-3 w-3" /> Terkini
          </span>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="marquee-track flex w-max animate-marquee items-center gap-8">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
                  {ticker.map((a) => (
                    <span key={`${copy}-${a.id}`} className="flex items-center gap-8 text-[12px] text-slate-300">
                      <span className="whitespace-nowrap">{a.title}</span>
                      <span className="clip-hex inline-block h-1.5 w-1.5 shrink-0 bg-sky-500" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_330px]">
        <div className="min-w-0">
          {browsing && featured && (
            <article className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md">
              <div className="relative aspect-[16/9] bg-slate-200 sm:aspect-[2/1]">
                {featured.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                  <CategoryChip category={featured.category} />
                  <h2 className="mt-3 max-w-3xl font-display text-xl font-bold leading-tight text-white sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-slate-300 sm:line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-slate-400">
                    {featured.source} · {featured.dateLabel}
                  </p>
                </div>
              </div>
            </article>
          )}

          {!browsing && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                {query.trim()
                  ? `Hasil untuk "${query.trim()}"`
                  : `Berita ${category}`}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {filtered.length} artikel
                </span>
              </h2>
              <button
                onClick={() => {
                  setCategory(HOME);
                  setQuery("");
                }}
                className="text-[12px] font-medium text-sky-600 hover:underline"
              >
                Reset
              </button>
            </div>
          )}

          {browsing ? (
            CATEGORIES.map((c) => {
              const list = articles.filter((a) => a.category === c);
              if (list.length === 0) return null;
              const color = CATEGORY_COLORS[c];
              return (
                <section key={c} className="mt-10">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-6 w-1.5 rounded-full" style={{ background: color }} />
                    <h2 className="font-display text-lg font-bold">{c}</h2>
                    <button
                      onClick={() => setCategory(c)}
                      className="ml-auto flex items-center gap-1 text-[12px] font-medium text-sky-600 hover:underline"
                    >
                      Lihat semua <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {list.slice(0, 3).map((a) => (
                      <ArticleCard key={a.id} a={a} />
                    ))}
                  </div>
                </section>
              );
            })
          ) : filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-4 font-display text-lg font-bold">Tidak ada hasil</p>
              <p className="mt-1 text-sm text-slate-500">
                Coba kata kunci lain atau jelajahi kategori berbeda.
              </p>
            </div>
          )}
        </div>

        {/* Right rail */}
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          {/* Trending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Flame className="h-4 w-4 text-rose-500" /> Terpopuler
            </h3>
            <ol className="mt-4 space-y-4">
              {trending.map((a, i) => (
                <li key={a.id} className="group flex cursor-pointer items-start gap-3">
                  <span className="font-display text-2xl font-bold leading-none text-slate-200 transition-colors group-hover:text-sky-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-800 transition-colors group-hover:text-sky-700">
                      {a.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Eye className="h-3 w-3" /> {formatCount(pseudoViews(a.id))} pembaca
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-sky-700 p-5 text-white shadow-md">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Mail className="h-4 w-4" /> Ringkasan Pagi
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-sky-100">
              5 berita terpenting, langsung ke inbox Anda setiap pukul 06.00.
            </p>
            {nlState === "sent" ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-[13px] font-medium">
                <CheckCircle2 className="h-4 w-4" /> Berhasil berlangganan!
              </p>
            ) : (
              <form onSubmit={subscribe} className="mt-4 space-y-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email Anda"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-sky-200 focus:border-white/60"
                />
                <button
                  type="submit"
                  disabled={nlState === "busy"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:opacity-70"
                >
                  {nlState === "busy" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Berlangganan Gratis"
                  )}
                </button>
                {nlState === "error" && (
                  <p className="text-[11px] text-rose-200">Gagal. Coba lagi.</p>
                )}
              </form>
            )}
          </div>

          {/* Hive network — cross promotion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Hexagon className="h-4 w-4 text-amber-500" /> Jaringan HiveComp
            </h3>
            <div className="mt-4 space-y-1">
              {(["popbeez", "nusabeez", "blinkbeez", "e-beez"] as const).map((slug) => {
                const b = BRANDS[slug];
                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="clip-hex h-8 w-8 shrink-0" style={{ background: b.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800">{b.name}</p>
                      <p className="text-[11px] text-slate-400">{b.platform}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-8 bg-slate-900 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="clip-hex grid h-9 w-9 place-items-center bg-sky-600 text-white">
              <Globe className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-white">
                PORTAL<span className="text-sky-500">-HUB</span>
              </p>
              <p className="text-[11px]">Semua berita, satu sarang.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setQuery("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="transition-colors hover:text-white"
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-[11px]">
            © 2026 Portal-Hub ·{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              HiveComp
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
