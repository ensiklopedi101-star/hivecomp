"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal, SectionTag } from "./reveal";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./social-icons";

const INTERESTS = [
  "Iklan & Sponsor",
  "Kolaborasi Konten",
  "Titip Produk di E-Beez",
  "Kerja Sama Media",
  "Lainnya",
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-stone-100 placeholder:text-stone-600 transition-colors duration-300 focus:border-hive/60 focus:bg-white/[0.05]";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact({
  contact,
  socials,
}: {
  contact: SiteSettings["contact"];
  socials: SiteSettings["socials"];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waFollowupUrl, setWaFollowupUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    contact: "",
    interest: INTERESTS[0],
    message: "",
    website: "", // Honeypot field (must stay empty)
  });

  const directWaUrl = buildWhatsAppUrl(
    contact.whatsapp,
    "Halo HiveComp, saya ingin menanyakan kerja sama.",
  );

  const CONTACT_ROWS = [
    { icon: Mail, label: "Email", value: contact.email },
    { icon: Phone, label: "WhatsApp", value: contact.whatsapp },
    { icon: MapPin, label: "Markas", value: contact.location },
  ].filter((r) => r.value.trim().length > 0);

  const SOCIAL_LINKS = [
    { icon: FacebookIcon, label: "Facebook HiveComp", href: socials.facebook },
    { icon: InstagramIcon, label: "Instagram HiveComp", href: socials.instagram },
    { icon: YoutubeIcon, label: "YouTube BlinkBeez", href: socials.youtube },
  ].filter((s) => s.href.trim().length > 0);

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res
        .json()
        .catch(() => ({ ok: false }))) as {
        ok?: boolean;
        error?: string;
        waFollowupUrl?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error || "Maaf, pesan gagal terkirim. Silakan coba lagi.");
        setStatus("error");
        return;
      }
      setWaFollowupUrl(data.waFollowupUrl || "");
      setStatus("sent");
    } catch {
      setErrorMsg("Maaf, pesan gagal terkirim. Silakan coba lagi.");
      setStatus("error");
    }
  };

  return (
    <section id="kontak" className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        {/* Left — pitch */}
        <div>
          <SectionTag index="06" label="Kontak" />
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Ada yang ingin
              <br />
              <span className="text-hive">kita bicarakan?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
              Sponsor, kolaborasi konten, atau produk untuk E-Beez — kirim satu
              pesan lewat formulir ini, dan kami akan mengarahkannya ke brand
              yang paling relevan.
            </p>
          </Reveal>

          {directWaUrl && (
            <Reveal delay={0.25}>
              <div className="mt-8">
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-ebeez/40 bg-ebeez/10 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ebeez transition-colors hover:bg-ebeez hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat Langsung via WhatsApp
                </a>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.3}>
            <div className="mt-10 space-y-5">
              {CONTACT_ROWS.map((r) => (
                <div key={r.label} className="flex items-center gap-4">
                  <span className="clip-hex grid h-11 w-11 shrink-0 place-items-center bg-hive/10 text-hive">
                    <r.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-stone-200">
                      {r.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            {SOCIAL_LINKS.length > 0 ? (
              <div className="mt-10 flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-stone-400 transition-all duration-300 hover:-translate-y-1 hover:border-hive hover:text-hive"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-10 max-w-xs text-[13px] leading-relaxed text-stone-500">
                Untuk diskusi kerja sama, kirim pesan lewat formulir di samping —
                kami arahkan ke brand yang paling relevan.
              </p>
            )}
          </Reveal>
        </div>

        {/* Right — form */}
        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-coal p-7 sm:p-9">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-hive/10 blur-[80px]" />

            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex min-h-[430px] flex-col items-center justify-center text-center"
                >
                  <span className="clip-hex grid h-16 w-16 place-items-center bg-hive/15 text-hive">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-bold">
                    Pesan terkirim!
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-400">
                    Terima kasih, {form.name.split(" ")[0] || "rekan"}. Pesan Anda
                    telah tercatat di sistem kami.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {waFollowupUrl && (
                      <a
                        href={waFollowupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-ebeez px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:opacity-90"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Teruskan ke WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setWaFollowupUrl("");
                        setForm({
                          name: "",
                          contact: "",
                          interest: INTERESTS[0],
                          message: "",
                          website: "",
                        });
                      }}
                      className="rounded-full border border-white/15 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-300 transition-colors hover:border-hive hover:text-hive"
                    >
                      Kirim pesan lain
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={submit}
                  className="relative space-y-5"
                >
                  {/* Honeypot field — invisible to humans */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={update("website")}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500"
                      >
                        Nama
                      </label>
                      <input
                        id="name"
                        required
                        maxLength={120}
                        value={form.name}
                        onChange={update("name")}
                        placeholder="Nama Anda"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact"
                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500"
                      >
                        Email / WhatsApp
                      </label>
                      <input
                        id="contact"
                        required
                        maxLength={160}
                        value={form.contact}
                        onChange={update("contact")}
                        placeholder="0812… atau nama@email.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="interest"
                      className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500"
                    >
                      Saya tertarik dengan
                    </label>
                    <select
                      id="interest"
                      value={form.interest}
                      onChange={update("interest")}
                      className={`${inputCls} appearance-none`}
                    >
                      {INTERESTS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500"
                    >
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      maxLength={2000}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Ceritakan kebutuhan Anda…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {status === "error" && (
                    <p className="rounded-xl border border-nusa/30 bg-nusa/10 px-4 py-3 text-xs text-nusa">
                      {errorMsg || "Maaf, pesan gagal terkirim. Silakan coba lagi."}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group flex w-full items-center justify-center gap-3 rounded-full bg-hive py-4 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-hive-soft disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        Mengirim…
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Kirim Pesan
                        <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <p className="text-center font-mono text-[10px] leading-relaxed text-stone-500">
                    Data Anda hanya dipakai untuk menindaklanjuti pesan ini. Lihat{" "}
                    <Link
                      href="/kebijakan#privasi"
                      className="text-stone-300 underline decoration-white/25 underline-offset-4 transition-colors hover:text-hive"
                    >
                      Kebijakan Privasi
                    </Link>
                    .
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
