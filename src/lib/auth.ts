import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hive_admin";

const DEFAULT_PASSWORD = "hive-admin";

/**
 * Password admin dari env.
 * Nilai kosong / hanya spasi dianggap BELUM diset — kalau tidak, env var yang
 * terlanjur dibuat dengan nilai kosong akan membuat login mustahil (password
 * menjadi string kosong, sedangkan form menolak input kosong).
 */
const adminPassword = () => {
  const raw = process.env.ADMIN_PASSWORD;
  return typeof raw === "string" && raw.trim() ? raw : DEFAULT_PASSWORD;
};

export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD?.trim();

/** Deterministic session token derived from the admin password (HMAC). */
export const sessionToken = () =>
  createHmac("sha256", adminPassword()).update("hivecomp-admin-v1").digest("hex");

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export const checkPassword = (input: string) => safeEqual(input, adminPassword());

export async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const value = store.get(ADMIN_COOKIE)?.value;
    return !!value && safeEqual(value, sessionToken());
  } catch {
    return false;
  }
}
