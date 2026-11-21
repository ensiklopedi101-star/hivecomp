// Pure helpers (tanpa dependensi DB) agar mudah diuji dan dipakai di mana saja.

/** Terima "@handle", "handle", "instagram.com/handle", atau URL https — keluaran selalu URL profil https atau "". */
export function igUrl(v: unknown): string {
  if (typeof v !== "string") return "";
  const t = v.trim();
  if (!t) return "";
  const handle = t.replace(/^@/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(handle)) return `https://www.instagram.com/${handle}/`;
  const withScheme = /^(www\.)?instagram\.com\//i.test(t) ? `https://${t}` : t;
  try {
    const u = new URL(withScheme);
    if (u.protocol === "https:" && /^(www\.)?instagram\.com$/i.test(u.hostname)) return u.toString();
  } catch {
    /* tidak valid */
  }
  return "";
}
