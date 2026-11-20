/**
 * Utilities for formatting WhatsApp numbers and building `wa.me` links.
 */

/** Normalize a human-entered phone number into digits suitable for wa.me. */
export function normalizeWhatsAppNumber(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("8")) {
    return `62${digits}`;
  }
  return digits;
}

/** True when a contact string looks like a phone/WhatsApp number rather than email. */
export function isLikelyPhoneNumber(contact: string): boolean {
  if (!contact || contact.includes("@")) return false;
  const digits = contact.replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 16;
}

/** Build a `https://wa.me/...` URL with an optional prefilled message. */
export function buildWhatsAppUrl(rawNumber: string, text?: string): string {
  const phone = normalizeWhatsAppNumber(rawNumber);
  if (!phone) return "";
  const base = `https://wa.me/${phone}`;
  if (!text || !text.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
