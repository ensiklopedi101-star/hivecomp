"use client";

import { useState, type ComponentType, type CSSProperties } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Heart,
  MessageCircle,
  Play,
  Radio,
  Share2,
  ShoppingBag,
} from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import type { BrandFeed, FeedItem, ShowcaseData } from "@/lib/showcase-types";
import { InstagramIcon, YoutubeIcon } from "./social-icons";
import { Reveal, SectionTag } from "./reveal";

type PanelIcon = ComponentType<{ className?: string }>;

const PANELS: {
  key: "popbeez" | "nusabeez" | "blinkbeez";
  name: string;
  channel: string;
  color: string;
  cta: string;
  icon: PanelIcon;
}[] = [
  {
    key: "popbeez" as const,
    name: "PopBeez",
    channel: "Facebook Page · News card hiburan",
    color: "#ff4d8d",
    cta: "Ikuti PopBeez",
    icon: Heart,
  },
  {
    key: "nusabeez" as const,
    name: "NusaBeez",
    channel: "Facebook Page · News card nasional",
    color: "#ff453a",
    cta: "Ikuti NusaBeez",
    icon: Radio,
  },
  {
    key: "blinkbeez" as const,
    name: "BlinkBeez",
    channel: "YouTube Shorts",
    color: "#a78bfa",
    cta: "Subscribe BlinkBeez",
    icon: YoutubeIcon as PanelIcon,
  },
];

const fmt = (n: number | null) =>
  n === null ? null : n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")} rb` : String(n);

const dateLabel = (s: string) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d);
};

function Metric({
  icon: Icon,
  value,
}: {
  icon: typeof Heart;
  value: number | null;
}) {
  const text = fmt(value);
  if (text === null) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-stone-500">
      <Icon className="h-3 w-3" /> {text}
    </span>
  );
}

function PostRow({ item, color }: { item: FeedItem; color: string }) {
  const inner = (
    <>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${color} 18%, #111113)` }}
        >
          <Play className="h-4 w-4" style={{ color }} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-stone-200">
          {item.text}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {dateLabel(item.publishedAt) && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-600">
              {dateLabel(item.publishedAt)}
            </span>
          )}
          <Metric icon={Heart} value={item.likes} />
          <Metric icon={MessageCircle} value={item.comments} />
          <Metric icon={Share2} value={item.shares} />
          <Metric icon={Play} value={item.views} />
        </div>
      </div>
    </>
  );
  return item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/20"
    >
      {inner}
    </a>
  ) : (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      {inner}
    </div>
  );
}

function PanelCard({
  p,
  delay,
  feed,
  igFeed,
  url,
  ig,
  logo,
}: {
  p: (typeof PANELS)[number];
  delay: number;
  feed?: BrandFeed;
  igFeed?: BrandFeed;
  url: string;
  ig: string;
  logo: string;
}) {
  const hasIg = !!igFeed?.connected && igFeed.items.length > 0;
  const fbOk = !!feed?.connected && feed.items.length > 0;
  // Bila Facebook belum terhubung tetapi Instagram sudah, tampilkan Instagram lebih dulu.
  const [tab, setTab] = useState<"fb" | "ig">(hasIg && !fbOk ? "ig" : "fb");
  const active = hasIg && tab === "ig" ? igFeed : feed;
  const channel = ig ? p.channel.replace("Facebook Page", "Facebook & Instagram") : p.channel;

  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0e]">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: p.color }}>
              {channel}
            </p>
            <h3 className="mt-1.5 font-display text-2xl font-bold">{p.name}</h3>
          </div>
          {logo ? (
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`Logo ${p.name}`} className="h-full w-full object-cover" />
            </span>
          ) : (
            <span
              className="clip-hex grid h-11 w-11 shrink-0 place-items-center"
              style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color }}
            >
              <p.icon className="h-4.5 w-4.5" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2.5 p-5">
          {hasIg && (
            <div
              role="tablist"
              aria-label={`Sumber postingan ${p.name}`}
              className="mb-1 flex gap-1 rounded-full border border-white/10 p-1"
            >
              {(
                [
                  ["fb", "Facebook"],
                  ["ig", "Instagram"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`flex-1 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    tab === k ? "font-semibold text-ink" : "text-stone-400 hover:text-stone-200"
                  }`}
                  style={tab === k ? { background: p.color } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {active?.connected && active.items.length > 0 ? (
            active.items.map((item) => <PostRow key={item.id} item={item} color={p.color} />)
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
              <span
                className="grid h-12 w-12 place-items-center rounded-full"
                style={{ background: `color-mix(in srgb, ${p.color} 12%, transparent)`, color: p.color }}
              >
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-sm font-bold text-stone-200">
                {p.key === "blinkbeez" ? "Segera hadir" : "Kanal resmi"}
              </p>
              <p className="mt-1.5 max-w-[230px] text-[12px] leading-relaxed text-stone-500">
                {p.key === "blinkbeez"
                  ? "Kanal video pendek sedang disiapkan. Ikuti kabarnya lewat tombol di bawah."
                  : "Postingan terbaru belum dapat ditampilkan di sini. Ikuti kanal resminya lewat tombol di bawah."}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-5">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: p.color }}
            >
              {p.cta}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ) : !ig ? (
            <span className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600">
              Kanal segera dibuka
            </span>
          ) : null}
          {ig && (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} di Instagram`}
              className={`group inline-flex items-center justify-center gap-2 rounded-full border py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[var(--c)] hover:text-ink ${
                url ? "shrink-0 px-5" : "flex-1"
              }`}
              style={{ "--c": p.color, color: p.color, borderColor: `color-mix(in srgb, ${p.color} 45%, transparent)` } as CSSProperties}
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              Instagram
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function Showcase({
  urls,
  logos,
  instagram,
  data,
}: {
  urls: SiteSettings["urls"];
  logos: SiteSettings["logos"];
  instagram: SiteSettings["instagram"];
  data: ShowcaseData;
}) {
  const realProducts = [
    {
      name: "E-Beez",
      desc: "Etalase produk UMKM: katalog, pembayaran, dan pengiriman dalam satu alur.",
      color: "#34d399",
      icon: ShoppingBag,
      logo: logos["e-beez"],
      url: urls["e-beez"],
      label: "Kunjungi E-Beez",
    },
    {
      name: "Portal-Hub",
      desc: "Rangkuman berita dari berbagai media, diperbarui setiap hari.",
      color: "#38bdf8",
      icon: Globe,
      logo: logos["portal-hub"],
      url: urls["portal-hub"],
      label: "Buka Portal-Hub",
    },
  ];

  return (
    <section id="showcase" className="relative border-y border-white/10 bg-coal/40">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionTag index="02" label="Showcase" />
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Postingan terbaru,
                <br />
                <span className="text-outline-hive">langsung dari sumbernya.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="max-w-sm">
            <p className="text-sm leading-relaxed text-stone-400">
              Setiap panel menarik postingan dari kanal resmi masing-masing
              brand. Angka reaksi dan komentar yang tampil berasal dari
              platform,{" "}
              <span className="text-hive">bukan perkiraan</span>.
            </p>
          </Reveal>
        </div>

        {/* Three brand panels */}
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {PANELS.map((p, i) => (
            <PanelCard
              key={p.key}
              p={p}
              delay={i * 0.08}
              feed={data?.[p.key]}
              igFeed={p.key === "blinkbeez" ? undefined : data?.instagram?.[p.key]}
              url={urls[p.key]}
              ig={p.key === "blinkbeez" ? "" : instagram[p.key]}
              logo={logos[p.key]}
            />
          ))}
        </div>

        {/* Products that already exist — CTA only, no dashboard */}
        <Reveal delay={0.1}>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {realProducts.map((r) => (
              <div
                key={r.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0c0c0e] p-6"
              >
                <div className="flex items-center gap-4">
                  {r.logo ? (
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.logo} alt={`Logo ${r.name}`} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <span
                      className="clip-hex grid h-12 w-12 shrink-0 place-items-center"
                      style={{
                        background: `color-mix(in srgb, ${r.color} 15%, transparent)`,
                        color: r.color,
                      }}
                    >
                      <r.icon className="h-5 w-5" />
                    </span>
                  )}
                  <div>
                    <p className="font-display text-lg font-bold">{r.name}</p>
                    <p className="mt-0.5 max-w-sm text-[12px] leading-relaxed text-stone-500">
                      {r.desc}
                    </p>
                  </div>
                </div>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-white/40"
                    style={{ color: r.color, borderColor: `color-mix(in srgb, ${r.color} 35%, transparent)` }}
                  >
                    {r.label}
                    <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600">
                    Tautan segera tersedia
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-stone-600">
          Angka reaksi, komentar, dan tayangan diambil dari kanal resmi masing-masing
          brand dan dapat berbeda dari tampilan di platform. Metrik internal seperti
          jangkauan dan retensi tidak dipublikasikan.
        </p>
      </div>
    </section>
  );
}
