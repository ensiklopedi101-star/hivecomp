import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { leads } from "@/db/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";

const ALLOWED_INTERESTS = new Set([
  "Iklan & Sponsor",
  "Kolaborasi Konten",
  "Titip Produk di E-Beez",
  "Kerja Sama Media",
  "Lainnya",
]);

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Optional server-side WhatsApp notification webhook.
 * Works with Fonnte, Wablas, Make/n8n/Zapier, or a custom WhatsApp Cloud API endpoint.
 * Never blocks or fails the lead submission if the webhook is unset or unreachable.
 */
async function notifyWhatsAppWebhook(payload: {
  name: string;
  contact: string;
  interest: string;
  message: string;
  targetPhone: string;
}) {
  const webhookUrl = process.env.WHATSAPP_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  const token = process.env.WHATSAPP_NOTIFY_TOKEN?.trim();
  const target =
    normalizeWhatsAppNumber(process.env.WHATSAPP_NOTIFY_TARGET ?? "") ||
    payload.targetPhone;

  const text = [
    "🐝 *Lead Baru — HiveComp*",
    `• Nama: ${payload.name}`,
    `• Kontak: ${payload.contact}`,
    `• Kategori: ${payload.interest}`,
    `• Pesan: ${payload.message}`,
  ].join("\n");

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = token;
    }
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        target,
        phone: target,
        message: text,
        text,
        lead: payload,
      }),
      signal: AbortSignal.timeout(4500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`leads:${ip}`, 5, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Terlalu banyak pengiriman pesan. Silakan coba lagi dalam ${rate.retryAfterSec} detik.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Honeypot field: if filled by a bot, silently succeed without saving.
    const honeypot = clean(body.website);
    if (honeypot) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const name = clean(body.name);
    const contact = clean(body.contact);
    const interest = clean(body.interest);
    const message = clean(body.message);

    if (!name || !contact || !message) {
      return NextResponse.json(
        { ok: false, error: "Mohon lengkapi semua kolom wajib." },
        { status: 400 },
      );
    }
    if (name.length > 120 || contact.length > 160 || message.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "Input melebihi batas karakter." },
        { status: 400 },
      );
    }

    const safeInterest = ALLOWED_INTERESTS.has(interest) ? interest : "Lainnya";

    await ensureSchema();
    await db.insert(leads).values({
      name,
      contact,
      interest: safeInterest,
      message,
    });

    const site = await getSettings();
    const ownerWa = normalizeWhatsAppNumber(site.contact.whatsapp);

    // Fire optional WhatsApp webhook notification
    const webhookSent = await notifyWhatsAppWebhook({
      name,
      contact,
      interest: safeInterest,
      message,
      targetPhone: ownerWa,
    });

    const waFollowupUrl = ownerWa
      ? buildWhatsAppUrl(
          ownerWa,
          `Halo HiveComp, saya ${name} (${contact}). Saya baru mengirim formulir terkait *${safeInterest}*:\n\n${message}`,
        )
      : "";

    return NextResponse.json(
      { ok: true, webhookSent, waFollowupUrl },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
