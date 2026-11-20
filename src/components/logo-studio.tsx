"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, CheckCircle2, Download, ExternalLink, Loader2, Moon, Palette, ShieldCheck, Sun } from "lucide-react";
import { LOGO_BRANDS, RECOMMENDED_LOGOS, SELECTED_LOGOS, findLogoConcept, logoAsset, type LogoBrand, type LogoChoice, type LogoSelections } from "@/lib/logo-concepts";

type Surface = "paper" | "dark" | "mono";
type View = "symbol" | "identity";
const STORAGE_KEY = "hivecomp-logo-shortlist-v2";

function readLocal(): LogoSelections {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const safe: LogoSelections = {};
    LOGO_BRANDS.forEach((b) => {
      if (b.concepts.some((c) => c.id === raw[b.id])) safe[b.id] = raw[b.id];
    });
    return safe;
  } catch { return {}; }
}

function ConceptCard({ brand, concept, selected, surface, view, busy, onSelect }: {
  brand: LogoBrand; concept: LogoChoice; selected: boolean; surface: Surface; view: View; busy: boolean; onSelect: () => void;
}) {
  const dark = surface === "dark";
  const markUrl = logoAsset(concept.id, surface === "mono" ? "mono" : "mark");
  return (
    <article className="logo-studio-card group overflow-hidden rounded-[22px] border bg-[#11130f] transition-all duration-300 hover:-translate-y-1" style={{ borderColor: selected ? brand.color : "#ffffff16" }}>
      <div className="relative flex h-[282px] flex-col items-center justify-center overflow-hidden border-b border-black/5 px-6" style={{ background: dark ? "#171b14" : "#f1efe7", color: dark ? "#f1efe7" : "#1a1e15" }}>
        <div className="absolute inset-x-5 top-4 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-45">{brand.id.toUpperCase()} / {concept.code}</span>
          {SELECTED_LOGOS[brand.id] === concept.id ? (
            <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider" style={{ borderColor: dark ? "#ffffff25" : "#1a1e1520", background: dark ? "#ffffff08" : "#dedecb" }}>Pilihan Anda</span>
          ) : concept.recommended ? (
            <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider" style={{ borderColor: dark ? "#ffffff25" : "#1a1e1520", background: dark ? "#ffffff08" : "#dedecb" }}>Rekomendasi</span>
          ) : null}
        </div>
        <span aria-hidden className="absolute left-5 top-14 h-3 w-3 border-l border-t opacity-15" />
        <span aria-hidden className="absolute bottom-14 right-5 h-3 w-3 border-b border-r opacity-15" />
        {view === "symbol" ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markUrl} alt={`${brand.name}, konsep ${concept.code}: ${concept.title}`} width={112} height={112} className="h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-105" />
            <p className="font-display text-[29px] font-bold tracking-tight">{brand.name}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoAsset(concept.id, dark ? "logo-dark" : "logo")} alt={`Identitas ${brand.name} — ${concept.title}`} width={580} height={204} className="w-full max-w-[340px] object-contain" style={surface === "mono" ? { filter: "grayscale(1) brightness(0)" } : undefined} />
        )}
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.15em] opacity-40">Uji ukuran kecil</span>
          <div className="flex items-center gap-3" aria-label="Pratinjau simbol 16, 24, dan 32 piksel">
            {[16, 24, 32].map((size) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={size} src={markUrl} width={size} height={size} alt="" className="object-contain" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div><h3 className="font-display text-xl font-semibold tracking-tight text-[#f2f0e9]">{concept.title}</h3><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#7f8575]">{concept.direction}</p></div>
          <span className="mt-0.5 font-mono text-xs" style={{ color: brand.color }}>0{Number(concept.code)}</span>
        </div>
        <p className="mt-4 min-h-[88px] text-[13px] leading-[1.8] text-[#a2a796]">{concept.description}</p>
        <div className="mt-4 border-t border-white/[0.07] pt-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#606955]">Penggunaan</p>
          <p className="mt-1.5 min-h-[55px] text-xs leading-relaxed text-[#89917d]">{concept.use}</p>
        </div>
        <button type="button" onClick={onSelect} disabled={busy} aria-pressed={selected} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-[11px] font-semibold transition-all duration-200 disabled:opacity-60" style={{ borderColor: selected ? brand.color : "#ffffff25", background: selected ? brand.color : "transparent", color: selected ? "#10150c" : "#e3e6db" }}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : selected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3 w-3 rounded-full border border-current opacity-60" />}
          {selected ? "Masuk pilihan Anda" : "Pilih konsep ini"}
        </button>
        <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 text-center font-mono text-[8px] uppercase tracking-[0.1em] text-[#9aa18e]">
          <a href={logoAsset(concept.id)} download className="py-1 transition-colors hover:text-white">SVG simbol ↗</a>
          <a href={logoAsset(concept.id, "logo")} download className="py-1 transition-colors hover:text-white">Wordmark ↗</a>
          <a href={`/logos/${concept.id}-mark.png`} download className="py-1 transition-colors hover:text-white">PNG ↗</a>
        </div>
      </div>
    </article>
  );
}

export default function LogoStudio({ initialSelections, admin }: { initialSelections: LogoSelections; admin: boolean }) {
  const [filter, setFilter] = useState("all");
  const [surface, setSurface] = useState<Surface>("paper");
  const [view, setView] = useState<View>("symbol");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [selections, setSelections] = useState<LogoSelections>(initialSelections);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const local = readLocal();
    if (Object.keys(local).length) {
      setSelections((current) => ({ ...current, ...local }));
      if (admin) {
        setMessage("Shortlist dari perangkat ini dimuat. Logo situs belum berubah; tekan Terapkan hanya jika Anda sudah yakin.");
      }
    }
  }, [admin]);

  const count = Object.keys(selections).length;
  const visible = LOGO_BRANDS.filter((b) => filter === "all" || b.id === filter);
  const remember = (next: LogoSelections) => { setSelections(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* local persistence is optional */ } };

  const choose = async (brand: LogoBrand, concept: LogoChoice) => {
    remember({ ...selections, [brand.id]: concept.id });
    setError(false);
    if (!admin) { setMessage(`${brand.name} ${concept.code} disimpan di perangkat ini. Situs belum berubah.`); return; }
    setBusy(brand.id);
    try {
      const res = await fetch("/api/admin/logo-concepts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand: brand.id, concept: concept.id }) });
      if (!res.ok) throw new Error();
      setMessage(`Pilihan ${brand.name} tersimpan di database. Situs belum berubah.`);
    } catch { setError(true); setMessage("Pilihan baru tersimpan di perangkat. Masuk admin lagi untuk menyimpannya ke database."); }
    finally { setBusy(""); }
  };

  const chooseRecommendations = async () => {
    remember(RECOMMENDED_LOGOS);
    setError(false);
    if (!admin) { setMessage("Enam rekomendasi masuk shortlist di perangkat Anda. Belum diterapkan."); return; }
    setBusy("all");
    try {
      const res = await fetch("/api/admin/logo-concepts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections: RECOMMENDED_LOGOS }) });
      if (!res.ok) throw new Error();
      setMessage("Enam rekomendasi tersimpan sebagai shortlist. Belum diterapkan.");
    } catch { setError(true); setMessage("Gagal menyimpan ke database. Pilihan lokal tetap ada."); }
    finally { setBusy(""); }
  };

  const apply = async () => {
    if (!admin || !count || applying) return;
    if (!window.confirm(`Terapkan ${count} simbol yang Anda pilih ke landing page? Logo lama untuk brand tersebut akan diganti. Teks, URL, dan data lain tidak berubah.`)) return;
    setApplying(true); setError(false);
    try {
      const res = await fetch("/api/admin/logo-concepts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerapkan pilihan.");
      setMessage(`${json.applied} logo diterapkan. Buka landing page untuk melihat hasilnya.`);
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : "Logo belum diterapkan."); }
    finally { setApplying(false); }
  };

  return (
    <main id="konten" className="min-h-svh bg-[#0b0e09] text-[#f1efe6]">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Kembali ke HiveComp">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/hivecomp-01-mark.svg" width={36} height={36} alt="" />
            <div className="border-l border-white/15 pl-3"><p className="font-display text-sm font-bold tracking-[0.12em]">HIVECOMP</p><p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.25em] text-[#858d76]">Brand studio / 001</p></div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#959d88] hover:text-white sm:inline-flex"><ArrowLeft className="h-3 w-3" /> Landing page</Link>
            <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-[10px] text-[#c5cbbd] hover:border-hive hover:text-hive">{admin ? "Panel admin" : "Masuk admin"}<ArrowUpRight className="ml-1.5 inline h-3 w-3" /></Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-[1320px] gap-12 overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-24">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.27em] text-[#aeb69c]"><span className="h-1.5 w-1.5 rounded-full bg-hive" /> Eksplorasi identitas / enam brand</p>
          <h1 className="mt-7 font-display text-[clamp(2.7rem,6.2vw,5.5rem)] font-medium leading-[1.01] tracking-[-0.065em]">Satu keluarga.<br /><span className="text-[#c4d29d]">Beda karakter.</span></h1>
          <p className="mt-6 max-w-[460px] text-[14px] leading-[1.9] text-[#969e87]">Tiga arah logo untuk setiap nama. Bukan sekadar ganti warna: bentuk, karakter, dan cara membacanya juga berbeda. Pilih yang paling mewakili brand Anda.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#konsep" className="inline-flex items-center gap-4 rounded-full bg-[#d3e6aa] px-6 py-3.5 text-[11px] font-semibold text-[#19220f] transition-colors hover:bg-[#e2f1c4]">Jelajahi 18 konsep <ArrowDown className="h-3.5 w-3.5" /></a>
            <a href="/logos/hivecomp-18-logo-concepts.zip" download className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-[11px] text-[#c2c9b5] hover:border-white/40"><Download className="h-3.5 w-3.5" /> Unduh paket lengkap</a>
          </div>
          <div className="mt-9 flex items-center gap-5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#657252] sm:gap-7"><span>06 brand</span><span>18 konsep</span><span>SVG + PNG</span><span>Outline vektor</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[390px] lg:ml-auto">
          <div aria-hidden className="absolute inset-6 rounded-full bg-[#b1ca7d]/10 blur-[75px]" />
          <div className="relative grid rotate-[-3deg] grid-cols-3 gap-2.5 rounded-[26px] border border-white/10 bg-[#13180f] p-3.5 shadow-2xl shadow-black/40 sm:gap-3">
            {LOGO_BRANDS.map((brand) => (
              <a key={brand.id} href="#konsep" onClick={() => setFilter(brand.id)} className="group/tile flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#eeede5] p-3 transition-transform duration-300 hover:-translate-y-1" aria-label={`Lihat tiga logo ${brand.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoAsset(SELECTED_LOGOS[brand.id])} alt="" width={58} height={58} className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
                <span className="font-display text-[10px] font-bold tracking-tight text-[#202719]">{brand.name}</span>
              </a>
            ))}
          </div>
          <div className="relative mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#161d10] px-4 py-2 text-[10px] text-[#95ab73]"><span className="h-1 w-1 rounded-full bg-[#c4d29d]" /> Satu keluarga, bukan enam logo seragam.</div>
        </div>
      </section>

      <div id="konsep" className="sticky top-0 z-30 scroll-mt-0 border-y border-white/[0.09] bg-[#0d110a]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <nav className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0" aria-label="Filter konsep per brand">
            {[{ id: "all", name: "Semua" }, ...LOGO_BRANDS].map((b) => <button key={b.id} type="button" onClick={() => setFilter(b.id)} aria-pressed={filter === b.id} className={`shrink-0 rounded-full px-3 py-2 text-[10px] transition-colors ${filter === b.id ? "bg-[#d3e6aa] font-semibold text-[#19220f]" : "text-[#8d997b] hover:bg-white/5 hover:text-white"}`}>{b.name}</button>)}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-white/10 p-0.5" aria-label="Latar pratinjau">
              {([{ id: "paper", title: "Terang", icon: Sun }, { id: "dark", title: "Gelap", icon: Moon }, { id: "mono", title: "Mono", icon: Palette }] as const).map((s) => <button key={s.id} type="button" onClick={() => setSurface(s.id)} title={s.title} aria-pressed={surface === s.id} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] ${surface === s.id ? "bg-white/10 text-[#e1e7d8]" : "text-[#738363]"}`}><s.icon className="h-3 w-3" />{s.title}</button>)}
            </div>
            <button type="button" onClick={() => setView(view === "symbol" ? "identity" : "symbol")} aria-pressed={view === "identity"} className="rounded-full border border-white/15 px-3 py-2 text-[9px] text-[#b0bba1] hover:border-white/30">{view === "symbol" ? "Lihat wordmark ↗" : "Lihat simbol ↗"}</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-7 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <p className="text-[#748564]">{recommendedOnly ? "Hanya enam konsep yang saya rekomendasikan." : "Bandingkan bentuknya dulu. Warna dapat disesuaikan setelah konsep dipilih."}</p>
          <label className="flex cursor-pointer items-center gap-2 text-[#b4c39e]"><input type="checkbox" checked={recommendedOnly} onChange={(e) => setRecommendedOnly(e.target.checked)} className="h-3 w-3 accent-[#d3e6aa]" /> Hanya rekomendasi</label>
        </div>

        {visible.map((brand, i) => (
          <section key={brand.id} className="border-b border-white/[0.08] py-10 sm:py-12" aria-labelledby={`studio-${brand.id}`}>
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="mb-2 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#7d8d6d]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: brand.color }} />{brand.category}</p><h2 id={`studio-${brand.id}`} className="font-display text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{brand.name}<span className="ml-3 align-middle font-mono text-[9px] font-normal tracking-normal text-[#516043]">/ 0{LOGO_BRANDS.findIndex((b) => b.id === brand.id) + 1}</span></h2><p className="mt-2 max-w-lg text-xs leading-relaxed text-[#899779]">{brand.intro}</p></div>
              <a href={`/logos/${brand.id}-board.png`} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 px-3.5 py-2.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#a1af90] hover:border-white/30 sm:self-auto">Lembar perbandingan <ExternalLink className="h-3 w-3" /></a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {brand.concepts.filter((c) => !recommendedOnly || c.recommended).map((c) => <ConceptCard key={c.id} brand={brand} concept={c} selected={selections[brand.id] === c.id} surface={surface} view={view} busy={busy === brand.id || busy === "all"} onSelect={() => choose(brand, c)} />)}
            </div>
          </section>
        ))}

        <section className="my-12 grid gap-7 rounded-[24px] border border-[#b4cc8c]/20 bg-[#131b0d] p-6 sm:p-9 lg:grid-cols-[0.9fr_1.1fr]">
          <div><span className="mb-3 inline-flex rounded-full bg-[#26301c] p-2.5 text-[#bcd79b]"><Check className="h-4 w-4" /></span><h2 className="font-display text-2xl font-medium tracking-tight">Kalau saya yang memilih.</h2><p className="mt-3 text-xs leading-[1.9] text-[#94a67d]">Colony untuk induk, bentuk yang langsung berkaitan dengan fungsi untuk tiap brand. Khusus BlinkBeez, saya pilih Blink Eye karena lebih melekat pada namanya daripada ikon play biasa.</p><button type="button" disabled={busy === "all"} onClick={chooseRecommendations} className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#96b56d]/40 px-4 py-2.5 text-[10px] text-[#d3e6aa] hover:bg-[#d3e6aa]/5">{busy === "all" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Jadikan enam rekomendasi sebagai shortlist</button></div>
          <div className="grid grid-cols-3 gap-2.5">
            {LOGO_BRANDS.map((b) => <div key={b.id} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c1207] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoAsset(RECOMMENDED_LOGOS[b.id]!)} width={44} height={44} alt="" className="h-11 w-11" /><p className="text-[10px] font-medium text-[#c3d0b2]">{b.name}</p><p className="font-mono text-[8px] text-[#738b5b]">{findLogoConcept(RECOMMENDED_LOGOS[b.id]!)?.title}</p></div>)}
          </div>
        </section>

        <section className="grid gap-7 border-b border-white/[0.08] pb-12 sm:grid-cols-3">
          {[
            { n: "01", title: "Simbolnya harus tetap terbaca.", text: "Pratinjau 16–32 px membantu menilai pemakaian sebagai avatar, favicon, dan watermark. Detail rumit tidak selalu menjadi nilai tambah." },
            { n: "02", title: "Warna bukan satu-satunya pembeda.", text: "Uji dengan tombol Mono. Logo yang hanya bisa dikenali lewat warna akan lebih sulit dipakai di stempel, dokumen, dan cetak satu warna." },
            { n: "03", title: "Masih konsep, belum merek terdaftar.", text: "Sebelum dipakai final, periksa kemiripan visual dan ketersediaan merek. Konsep ini belum melalui pemeriksaan merek dagang." },
          ].map((note) => <div key={note.n}><p className="mb-3 font-mono text-[9px] text-[#738762]">{note.n} / CATATAN DESAIN</p><h3 className="font-display text-base font-medium text-[#d3dcc9]">{note.title}</h3><p className="mt-2 text-xs leading-[1.9] text-[#80916e]">{note.text}</p></div>)}
        </section>
        <footer className="flex flex-col justify-between gap-4 py-7 text-[10px] text-[#697d55] sm:flex-row"><p>HiveComp / Brand Studio · Simbol orisinal, tipografi Space Grotesk (SIL OFL).</p><a href="/logos/all-concepts.png" download className="inline-flex items-center gap-2 text-[#b3c39f] hover:text-white"><Download className="h-3 w-3" /> Unduh poster semua konsep</a></footer>
      </div>

      <aside aria-label="Shortlist logo" className="sticky bottom-0 z-40 border-t border-[#455633] bg-[#141d0d]/95 shadow-[0_-12px_45px_#0004] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0"><p className="flex items-center gap-2 text-[11px] font-semibold text-[#d8e4c9]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d3e6aa] font-mono text-[9px] text-[#19220f]">{count}/6</span> Shortlist logo Anda</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-wider text-[#889f71]">{count ? LOGO_BRANDS.filter((b) => selections[b.id]).map((b) => <span key={b.id}>{b.name} <span style={{ color: b.color }}>{selections[b.id]!.slice(-2)}</span></span>) : <span>Pilih satu konsep untuk tiap brand. Tidak ada perubahan otomatis pada situs.</span>}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="max-w-[250px] text-[10px] leading-relaxed text-[#8a9e73]">{admin ? "Tersimpan di database setelah Anda memilih. Penerapan terpisah." : "Pilihan disimpan di perangkat ini. Masuk admin untuk menerapkannya."}</p>
            {admin ? <button type="button" disabled={!count || applying || !!busy} onClick={apply} className="inline-flex items-center gap-2 rounded-full bg-[#d3e6aa] px-5 py-3 text-[10px] font-semibold text-[#19220f] disabled:cursor-not-allowed disabled:opacity-40">{applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Terapkan ke landing page</button> : <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-[#a1bf7b]/35 px-5 py-3 text-[10px] text-[#d3e6aa]"><ShieldCheck className="h-3.5 w-3.5" /> Masuk admin</Link>}
          </div>
        </div>
        {message && <p role="status" aria-live="polite" className={`border-t border-white/5 px-5 py-2 text-center text-[11px] ${error ? "text-red-300" : "text-[#c5df9f]"}`}>{message}</p>}
      </aside>
    </main>
  );
}
