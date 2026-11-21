"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Hexagon,
  Image as ImageIcon,
  Inbox,
  Loader2,
  ListChecks,
  LogOut,
  MessageCircle,
  Newspaper,
  Plug,
  Plus,
  Save,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import type { PreflightCheck } from "@/lib/preflight";
import type { ConnectorGuidanceRow } from "@/lib/connector-guidance-types";
import { BRANDS, BRAND_SLUGS } from "@/lib/brands";
import { buildWhatsAppUrl, isLikelyPhoneNumber } from "@/lib/whatsapp";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  type ArticleDTO,
  type LeadDTO,
} from "@/lib/shared";

type Tab = "rilis" | "tampilan" | "konektor" | "berita" | "pesan";
type SaveState = "idle" | "saving" | "saved" | "error";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 transition-colors focus:border-hive/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-coal p-6 sm:p-8">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {desc && <p className="mt-1 text-xs leading-relaxed text-stone-500">{desc}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export default function AdminDashboard({
  initialSettings,
  leads,
  articles,
  guidance,
  checks,
  notes,
}: {
  initialSettings: SiteSettings;
  leads: LeadDTO[];
  articles: ArticleDTO[];
  guidance: ConnectorGuidanceRow[];
  checks: PreflightCheck[];
  notes: string[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("rilis");
  const [s, setS] = useState<SiteSettings>(initialSettings);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [form, setForm] = useState({
    title: "",
    category: "Nasional" as string,
    excerpt: "",
    imageUrl: "",
    source: "Portal-Hub",
  });
  const [articleBusy, setArticleBusy] = useState(false);
  const [articleError, setArticleError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [logoBusy, setLogoBusy] = useState<Record<string, boolean>>({});
  const [logoMsg, setLogoMsg] = useState<Record<string, string>>({});

  const uploadLogo = async (slug: string, file: File) => {
    setLogoBusy((b) => ({ ...b, [slug]: true }));
    setLogoMsg((m) => ({ ...m, [slug]: "" }));
    try {
      const fd = new FormData();
      fd.set("slug", slug);
      fd.set("file", file);
      const res = await fetch("/api/admin/logo", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Gagal mengunggah.");
      setS((prev) => ({ ...prev, logos: { ...prev.logos, [slug]: data.url! } }));
      setLogoMsg((m) => ({ ...m, [slug]: "Logo tersimpan." }));
    } catch (err) {
      setLogoMsg((m) => ({
        ...m,
        [slug]: err instanceof Error ? err.message : "Gagal mengunggah.",
      }));
    } finally {
      setLogoBusy((b) => ({ ...b, [slug]: false }));
    }
  };

  const removeLogo = async (slug: string) => {
    setLogoBusy((b) => ({ ...b, [slug]: true }));
    try {
      await fetch("/api/admin/logo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      setS((prev) => ({ ...prev, logos: { ...prev.logos, [slug]: "" } }));
      setLogoMsg((m) => ({ ...m, [slug]: "Logo dihapus." }));
    } finally {
      setLogoBusy((b) => ({ ...b, [slug]: false }));
    }
  };

  const saveSettings = async () => {
    if (saveState === "saving") return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      router.refresh();
      setTimeout(() => setSaveState("idle"), 2600);
    } catch {
      setSaveState("error");
    }
  };

  const addArticle = async () => {
    if (articleBusy) return;
    setArticleBusy(true);
    setArticleError("");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan.");
      setForm({ title: "", category: "Nasional", excerpt: "", imageUrl: "", source: "Portal-Hub" });
      router.refresh();
    } catch (err) {
      setArticleError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setArticleBusy(false);
    }
  };

  const deleteArticle = async (id: number) => {
    if (deletingId !== null) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/articles?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const pendingRequired = checks.filter((c) => !c.ok && !c.optional).length;
  const TABS: { id: Tab; label: string; icon: typeof Settings2; count?: number }[] = [
    { id: "rilis", label: "Sebelum Rilis", icon: ListChecks, count: pendingRequired },
    { id: "tampilan", label: "Tampilan & URL", icon: Settings2 },
    { id: "konektor", label: "Hubungkan Showcase", icon: Plug },
    { id: "pesan", label: "Pesan Masuk", icon: Inbox, count: leads.length },
    { id: "berita", label: "Artikel Demo (Prototipe)", icon: Newspaper, count: articles.length },
  ];

  return (
    <main className="min-h-svh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="clip-hex grid h-9 w-9 place-items-center bg-hive text-ink">
              <Hexagon className="h-4 w-4" strokeWidth={2.75} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-[0.18em]">
                HIVE<span className="text-hive">COMP</span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-stone-500">
                Panel Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/unduhan" className="inline-flex items-center gap-2 rounded-full bg-hive px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-hive-soft">Pusat Unduhan <Download className="h-3 w-3" /></Link>
            <Link href="/studio-logo" className="inline-flex items-center gap-2 rounded-full border border-hive/30 bg-hive/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-hive transition-colors hover:bg-hive/10">Studio Logo <ArrowUpRight className="h-3 w-3" /></Link>
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-hive hover:text-hive sm:inline-flex"
            >
              Lihat Situs <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-nusa hover:text-nusa"
            >
              Keluar <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-28 pt-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
                tab === t.id
                  ? "bg-hive text-ink"
                  : "border border-white/10 text-stone-400 hover:border-hive/40 hover:text-hive"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {typeof t.count === "number" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] ${
                    tab === t.id ? "bg-ink/15" : "bg-white/10"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============ TAB: SEBELUM RILIS ============ */}
        {tab === "rilis" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-hive/25 bg-hive/[0.06] p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-hive">
                Checklist pra-rilis
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                {pendingRequired === 0
                  ? "Siap dipasang ke domain."
                  : `${pendingRequired} hal perlu Anda isi dulu.`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-400">
                Daftar ini dihitung dari nilai aktual di database dan environment
                — bukan perkiraan. Item bertanda <span className="text-stone-200">Opsional</span>{" "}
                boleh menyusul; tanpa itu halaman tetap tampil jujur dan aman.
              </p>
            </div>

            <div className="space-y-2">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-coal p-5"
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      c.ok
                        ? "bg-ebeez/15 text-ebeez"
                        : c.optional
                          ? "bg-white/10 text-stone-400"
                          : "bg-nusa/15 text-nusa"
                    }`}
                  >
                    {c.ok ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="font-mono text-xs font-bold">!</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-100">{c.label}</p>
                      {c.optional && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-400">
                          Opsional
                        </span>
                      )}
                    </div>
                    <p className="mt-1 break-words text-[12px] leading-relaxed text-stone-500">
                      {c.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-coal p-6">
              <h3 className="font-display text-base font-bold">Catatan struktur</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-stone-400">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ============ TAB: TAMPILAN & URL ============ */}
        {tab === "tampilan" && (
          <div className="mt-8 space-y-6">
            <Card
              title="Hero & Copywriting"
              desc="Teks utama di halaman depan. Baris 2 tampil sebagai outline, bagian akhir baris 3 berwarna kuning madu."
            >
              <Field label="Kicker (badge kecil di atas judul)">
                <input
                  className={inputCls}
                  value={s.hero.kicker}
                  maxLength={120}
                  onChange={(e) => setS({ ...s, hero: { ...s.hero, kicker: e.target.value } })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Judul baris 1">
                  <input
                    className={inputCls}
                    value={s.hero.line1}
                    maxLength={60}
                    onChange={(e) => setS({ ...s, hero: { ...s.hero, line1: e.target.value } })}
                  />
                </Field>
                <Field label="Judul baris 2 (outline)">
                  <input
                    className={inputCls}
                    value={s.hero.line2}
                    maxLength={60}
                    onChange={(e) => setS({ ...s, hero: { ...s.hero, line2: e.target.value } })}
                  />
                </Field>
                <Field label="Judul baris 3 — bagian putih">
                  <input
                    className={inputCls}
                    value={s.hero.line3a}
                    maxLength={40}
                    onChange={(e) => setS({ ...s, hero: { ...s.hero, line3a: e.target.value } })}
                  />
                </Field>
                <Field label="Judul baris 3 — bagian kuning">
                  <input
                    className={inputCls}
                    value={s.hero.line3b}
                    maxLength={40}
                    onChange={(e) => setS({ ...s, hero: { ...s.hero, line3b: e.target.value } })}
                  />
                </Field>
              </div>
              <Field label="Deskripsi hero">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  maxLength={600}
                  value={s.hero.description}
                  onChange={(e) => setS({ ...s, hero: { ...s.hero, description: e.target.value } })}
                />
              </Field>
            </Card>

            <Card
              title="URL Brand"
              desc="Tautan resmi tiap brand — dipakai tombol CTA di halaman brand. Kosongkan Portal-Hub untuk memakai halaman demo bawaan."
            >
              {BRAND_SLUGS.map((slug) => (
                <Field key={slug} label={`${BRANDS[slug].name} · ${BRANDS[slug].platform}`}>
                  <div className="flex items-center gap-3">
                    <span
                      className="clip-hex h-4 w-4 shrink-0"
                      style={{ background: BRANDS[slug].color }}
                    />
                    <input
                      className={inputCls}
                      placeholder={
                        slug === "portal-hub"
                          ? "https://www.portal-hub.online"
                          : slug === "e-beez"
                            ? "Isi subdomain E-Beez (mis. e-beez.hivecomp.my.id)"
                            : `https://…`
                      }
                      value={s.urls[slug]}
                      maxLength={300}
                      onChange={(e) => setS({ ...s, urls: { ...s.urls, [slug]: e.target.value } })}
                    />
                  </div>
                </Field>
              ))}
              <div className="grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
                {(["popbeez", "nusabeez"] as const).map((k) => (
                  <Field key={k} label={`Instagram ${BRANDS[k].name} (opsional)`}>
                    <input
                      className={inputCls}
                      placeholder="@popbeez  atau  https://www.instagram.com/popbeez/"
                      value={s.instagram[k]}
                      maxLength={300}
                      onChange={(e) =>
                        setS({ ...s, instagram: { ...s.instagram, [k]: e.target.value } })
                      }
                    />
                  </Field>
                ))}
                <p className="text-[11px] leading-relaxed text-stone-500 sm:col-span-2">
                  Cukup isi <code className="font-mono text-hive">@handle</code> — alamat lengkapnya dibuat otomatis.
                  Tombol Instagram langsung muncul di kartu Ekosistem dan panel Showcase. Untuk menampilkan
                  postingannya juga, lihat tab <span className="text-stone-300">Hubungkan Showcase</span>.
                </p>
              </div>
            </Card>

            <Card
              title="Logo Brand"
              desc="Upload logo tiap brand (PNG/JPG/WEBP/SVG/GIF, maks 400 KB). Logo dipakai di bagian Ekosistem dan Showcase. Disimpan langsung begitu Anda memilih file — tidak perlu menekan Simpan."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {BRAND_SLUGS.map((slug) => {
                  const current = s.logos[slug];
                  return (
                    <div
                      key={slug}
                      className="rounded-2xl border border-white/10 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                          {current ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={current}
                              alt={`Logo ${BRANDS[slug].name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              className="clip-hex h-6 w-6"
                              style={{ background: BRANDS[slug].color }}
                            />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-100">
                            {BRANDS[slug].name}
                          </p>
                          <p className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
                            {current ? "Logo terpasang" : "Belum ada logo"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-hive/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hive transition-colors hover:bg-hive hover:text-ink">
                          {logoBusy[slug] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          {current ? "Ganti" : "Upload"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                            className="hidden"
                            disabled={logoBusy[slug]}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadLogo(slug, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {current && (
                          <button
                            onClick={() => removeLogo(slug)}
                            disabled={logoBusy[slug]}
                            aria-label={`Hapus logo ${BRANDS[slug].name}`}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-nusa/30 text-nusa transition-colors hover:bg-nusa/10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {logoMsg[slug] && (
                        <p className="mt-2 text-[11px] text-ebeez">{logoMsg[slug]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="flex items-center gap-2 text-[11px] text-stone-500">
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-stone-600" />
                Logo dengan latar transparan (PNG/SVG) tampil paling rapi di atas tema gelap.
              </p>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Kontak" desc="Ditampilkan di bagian kontak landing page.">
                <Field label="Email">
                  <input
                    className={inputCls}
                    value={s.contact.email}
                    maxLength={160}
                    onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    className={inputCls}
                    value={s.contact.whatsapp}
                    maxLength={40}
                    onChange={(e) => setS({ ...s, contact: { ...s.contact, whatsapp: e.target.value } })}
                  />
                </Field>
                <Field label="Lokasi">
                  <input
                    className={inputCls}
                    value={s.contact.location}
                    maxLength={160}
                    onChange={(e) => setS({ ...s, contact: { ...s.contact, location: e.target.value } })}
                  />
                </Field>
              </Card>

              <Card title="Media Sosial" desc="Ikon sosial di bagian kontak.">
                <Field label="Facebook">
                  <input
                    className={inputCls}
                    value={s.socials.facebook}
                    maxLength={300}
                    onChange={(e) => setS({ ...s, socials: { ...s.socials, facebook: e.target.value } })}
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    className={inputCls}
                    value={s.socials.instagram}
                    maxLength={300}
                    onChange={(e) => setS({ ...s, socials: { ...s.socials, instagram: e.target.value } })}
                  />
                </Field>
                <Field label="YouTube">
                  <input
                    className={inputCls}
                    value={s.socials.youtube}
                    maxLength={300}
                    onChange={(e) => setS({ ...s, socials: { ...s.socials, youtube: e.target.value } })}
                  />
                </Field>
              </Card>
            </div>

            <Card
              title="Target 12 Bulan"
              desc="Angka pada bagian Target di landing page (animasi counter)."
            >
              {s.targets.map((t, i) => (
                <div key={i} className="grid grid-cols-[100px_90px_1fr] gap-3">
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={t.to}
                    onChange={(e) => {
                      const targets = [...s.targets];
                      targets[i] = { ...t, to: Math.max(0, Number(e.target.value) || 0) };
                      setS({ ...s, targets });
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="suffix"
                    value={t.suffix}
                    maxLength={12}
                    onChange={(e) => {
                      const targets = [...s.targets];
                      targets[i] = { ...t, suffix: e.target.value };
                      setS({ ...s, targets });
                    }}
                  />
                  <input
                    className={inputCls}
                    value={t.label}
                    maxLength={80}
                    onChange={(e) => {
                      const targets = [...s.targets];
                      targets[i] = { ...t, label: e.target.value };
                      setS({ ...s, targets });
                    }}
                  />
                </div>
              ))}
            </Card>

            {/* Sticky save bar */}
            <div className="sticky bottom-0 z-30 -mx-5 border-t border-white/10 bg-ink/90 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  {saveState === "saved" ? (
                    <span className="flex items-center gap-2 text-ebeez">
                      <CheckCircle2 className="h-4 w-4" /> Tersimpan — situs langsung diperbarui
                    </span>
                  ) : saveState === "error" ? (
                    <span className="text-nusa">Gagal menyimpan. Coba lagi.</span>
                  ) : (
                    "Perubahan tampil setelah disimpan"
                  )}
                </p>
                <button
                  onClick={saveSettings}
                  disabled={saveState === "saving"}
                  className="inline-flex items-center gap-2.5 rounded-full bg-hive px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft disabled:opacity-60"
                >
                  {saveState === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Simpan <Save className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB: KONEKTOR SHOWCASE ============ */}
        {tab === "konektor" && (
          <div className="mt-8 space-y-6">
            <Card
              title="Hubungkan Showcase PopBeez & NusaBeez"
              desc="Panel Showcase di landing page menampilkan postingan asli begitu konektor aktif. Pilih sumber datanya — Meta Graph API, atau backend PopBeez & NusaBeez Anda sendiri. Keduanya tidak harus dipakai bersamaan."
            >
              <div className="space-y-3">
                {guidance.length === 0 && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-500">
                    Panduan belum tersedia. Buka halaman ini lagi setelah tabel koneksi terbentuk otomatis di database.
                  </p>
                )}
                {guidance.map((g) => (
                  <div
                    key={`${g.brand}-${g.method}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="clip-hex h-3 w-3 shrink-0"
                        style={{
                          background:
                            g.brand === "popbeez"
                              ? "#ff4d8d"
                              : g.brand === "nusabeez"
                                ? "#ff453a"
                                : "#ffb000",
                        }}
                      />
                      <span className="font-display text-sm font-bold capitalize">
                        {g.brand === "popbeez" ? "PopBeez" : g.brand === "nusabeez" ? "NusaBeez" : g.brand}
                      </span>
                      <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-400">
                        {g.method}
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-stone-400">{g.summary}</p>

                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-hive">Langkah</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-stone-300">{g.steps}</p>

                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                      Yang perlu disiapkan
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-stone-400">{g.credentials}</p>

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3.5">
                      <Plug className="mt-0.5 h-4 w-4 shrink-0 text-hive" />
                      <p className="text-[12px] leading-relaxed text-stone-400">{g.tradeoffs}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-hive/20 bg-hive/[0.05] p-4">
                <p className="text-[12px] leading-relaxed text-stone-300">
                  <span className="font-semibold text-hive">Keputusan ada di Anda.</span> Meta Graph API
                  cocok bila Anda tidak ingin menyentuh backend Pop/Nusa. Backend bersama lebih stabil
                  bila sudah menyimpan data postingan. Setelah memilih, set kredensial di env Vercel,
                  lalu panel Showcase mengambil data sendiri — tanpa perubahan kode.
                </p>
              </div>
            </Card>

            <Card
              title="Env yang dibutuhkan"
              desc="Semua dibaca server-side. Jangan beri prefix NEXT_PUBLIC_."
            >
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  ["POPBEEZ_API_URL", "URL lengkap endpoint postingan PopBeez di backend Anda"],
                  ["POPBEEZ_API_TOKEN", "Bearer token backend (dipakai bersama bila token NusaBeez kosong)"],
                  ["NUSABEEZ_API_URL", "URL lengkap endpoint postingan NusaBeez di backend Anda"],
                  ["NUSABEEZ_API_TOKEN", "Opsional — bila token NusaBeez berbeda"],
                  ["META_PAGE_TOKEN", "Page access token PopBeez/NusaBeez (jalan Meta)"],
                  ["META_PAGE_ID_POPBEEZ", "ID Page PopBeez"],
                  ["META_PAGE_ID_NUSABEEZ", "ID Page NusaBeez"],
                  ["META_IG_USER_ID_POPBEEZ", "Opsional — ID akun Instagram PopBeez (dicari otomatis dari Page bila kosong)"],
                  ["META_IG_USER_ID_NUSABEEZ", "Opsional — ID akun Instagram NusaBeez"],
                  ["META_GRAPH_VERSION", "Opsional — default v26.0"],
                  ["YOUTUBE_API_KEY", "Bila BlinkBeez sudah punya kanal"],
                  ["YOUTUBE_CHANNEL_ID_BLINKBEEZ", "Channel ID BlinkBeez"],
                  ["WHATSAPP_NOTIFY_WEBHOOK_URL", "Opsional — notifikasi lead baru ke WA"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                    <p className="font-mono text-[11px] font-semibold text-hive">{k}</p>
                    <p className="mt-1 text-[12px] text-stone-500">{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            <p className="rounded-2xl border border-white/10 bg-coal p-5 text-[12px] leading-relaxed text-stone-500">
              Selama konektor belum aktif, panel Showcase tetap tampil profesional: status
              “belum terhubung” + tombol ikuti/subscribe. Tidak ada angka contoh yang ditampilkan.
            </p>
          </div>
        )}

        {/* ============ TAB: BERITA ============ */}
        {tab === "berita" && (
          <div className="mt-8 space-y-6">
            <Card
              title="Terbitkan Berita Baru"
              desc="Berita untuk prototipe Portal-Hub di aplikasi ini. CATATAN: ini bukan backend www.portal-hub.online, dan tidak terhubung ke news card PopBeez/NusaBeez."
            >
              <Field label="Judul">
                <input
                  className={inputCls}
                  value={form.title}
                  maxLength={220}
                  placeholder="Judul berita…"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Kategori">
                  <select
                    className={`${inputCls} appearance-none`}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sumber">
                  <input
                    className={inputCls}
                    value={form.source}
                    maxLength={120}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Ringkasan">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  maxLength={600}
                  placeholder="1–2 kalimat ringkasan berita…"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </Field>
              <Field label="URL Gambar (opsional)">
                <input
                  className={inputCls}
                  value={form.imageUrl}
                  maxLength={600}
                  placeholder="https://… (jpg/png)"
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </Field>
              {articleError && (
                <p className="rounded-xl border border-nusa/30 bg-nusa/10 px-4 py-3 text-xs text-nusa">
                  {articleError}
                </p>
              )}
              <button
                onClick={addArticle}
                disabled={articleBusy}
                className="inline-flex items-center gap-2.5 rounded-full bg-hive px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft disabled:opacity-60"
              >
                {articleBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Terbitkan <Plus className="h-4 w-4" />
                  </>
                )}
              </button>
            </Card>

            <div className="space-y-3">
              {articles.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-coal p-6 text-sm text-stone-500">
                  Belum ada berita di database — Portal-Hub sedang menampilkan
                  konten demo bawaan. Terbitkan berita pertama Anda di atas.
                </p>
              )}
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-coal p-4"
                >
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.imageUrl}
                      alt=""
                      className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block"
                    />
                  ) : (
                    <div className="hidden h-14 w-20 shrink-0 rounded-lg bg-white/5 sm:block" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-100">{a.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          background: `color-mix(in srgb, ${CATEGORY_COLORS[a.category] ?? "#888"} 18%, transparent)`,
                          color: CATEGORY_COLORS[a.category] ?? "#aaa",
                        }}
                      >
                        {a.category}
                      </span>
                      {a.source} · {a.dateLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteArticle(a.id)}
                    disabled={deletingId === a.id}
                    aria-label={`Hapus ${a.title}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-stone-500 transition-colors hover:border-nusa hover:text-nusa disabled:opacity-50"
                  >
                    {deletingId === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ TAB: PESAN ============ */}
        {tab === "pesan" && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-coal p-5">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Pesan Kerja Sama ({leads.length})
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-400">
                  Balas langsung ke WhatsApp pengirim dalam 1 klik, teruskan ke
                  WhatsApp Anda, atau unduh seluruh data sebagai CSV. Untuk
                  notifikasi WA otomatis setiap ada pesan baru, set{" "}
                  <code className="font-mono text-hive">WHATSAPP_NOTIFY_WEBHOOK_URL</code>{" "}
                  di Vercel.
                </p>
              </div>
              <a
                href="/api/admin/leads/export"
                download
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-hive px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-hive-soft"
              >
                <Download className="h-3.5 w-3.5" /> Unduh CSV
              </a>
            </div>

            {leads.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-coal p-6 text-sm text-stone-500">
                Belum ada pesan. Kiriman formulir kerja sama di landing page akan
                muncul di sini.
              </p>
            )}
            {leads.map((l) => {
              const replyWaUrl = isLikelyPhoneNumber(l.contact)
                ? buildWhatsAppUrl(
                    l.contact,
                    `Halo ${l.name}, terima kasih telah menghubungi HiveComp terkait ${l.interest}.`,
                  )
                : "";
              const forwardWaUrl = s.contact.whatsapp.trim()
                ? buildWhatsAppUrl(
                    s.contact.whatsapp,
                    `🐝 *Lead HiveComp*\nNama: ${l.name}\nKontak: ${l.contact}\nKategori: ${l.interest}\nTanggal: ${l.dateLabel}\n\nPesan:\n${l.message}`,
                  )
                : "";

              return (
                <div key={l.id} className="rounded-2xl border border-white/10 bg-coal p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-100">
                      {l.name}
                      <span className="ml-2 font-normal text-stone-400">· {l.contact}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-hive/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-hive">
                        {l.interest}
                      </span>
                      <span className="font-mono text-[10px] text-stone-500">{l.dateLabel}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">{l.message}</p>

                  {(replyWaUrl || forwardWaUrl || l.contact.includes("@")) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-3">
                      {replyWaUrl && (
                        <a
                          href={replyWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-ebeez px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-90"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Balas via WhatsApp
                        </a>
                      )}
                      {l.contact.includes("@") && (
                        <a
                          href={`mailto:${l.contact}?subject=${encodeURIComponent(`Tindak Lanjut Kerja Sama HiveComp — ${l.interest}`)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-300 transition-colors hover:border-hive hover:text-hive"
                        >
                          Balas via Email
                        </a>
                      )}
                      {forwardWaUrl && (
                        <a
                          href={forwardWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-ebeez/35 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ebeez transition-colors hover:bg-ebeez/10"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Teruskan ke WA Saya
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
