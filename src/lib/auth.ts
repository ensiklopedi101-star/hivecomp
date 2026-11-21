import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hive_admin";

const adminPassword = () => process.env.ADMIN_PASSWORD ?? "hive-admin";

export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD;

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
