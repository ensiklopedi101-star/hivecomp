import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Works locally and on Vercel:
// - Local sandbox provides DATABASE_URL.
// - Vercel Postgres / Neon / Supabase provide DATABASE_URL or POSTGRES_URL.
// - Integrasi Vercel Marketplace (Neon, Supabase, ...) bisa menambahkan PREFIX
//   pada nama env var (mis. `HIVE_DATABASE_URL`, `HIVE_POSTGRES_URL`). Tanpa
//   prefix tersebut `DATABASE_URL` biasa TIDAK ADA, jadi resolveDatabaseUrl()
//   juga memindai var berakhiran `_DATABASE_URL` / `_POSTGRES_URL`.
//
// The pool is created lazily on the FIRST query. This keeps `next build`
// working even when no database env var is present yet (e.g. someone deploys
// before attaching the Vercel Postgres integration).
type Database = NodePgDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __hivecompPool?: Pool;
  __hivecompDb?: Database;
};

/** Nama env var standar, urut prioritas (pooled lebih dulu). */
const STANDARD_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

const STANDARD_KEYS_SET: ReadonlySet<string> = new Set(STANDARD_URL_KEYS);

/** `HIVE_DATABASE_URL`, `HIVE_POSTGRES_URL_NON_POOLING`, `X_DATABASE_URL_UNPOOLED`, dst. */
const PREFIXED_URL_RE = /_(DATABASE|POSTGRES)_URL(_(UNPOOLED|NON_POOLING|NO_SSL))?$/;

const isNonPooled = (key: string) => /(UNPOOLED|NON_POOLING|NO_SSL)$/.test(key);

const readUrl = (key: string): string | null => {
  const raw = process.env[key];
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value ? value : null;
};

export type DatabaseUrlSource = { key: string; url: string };

/**
 * Cari connection string dari env.
 * `key` = nama env var asal, dipakai `/api/health` untuk diagnosis.
 */
export function resolveDatabaseUrl(): DatabaseUrlSource | null {
  for (const key of STANDARD_URL_KEYS) {
    const url = readUrl(key);
    if (url) return { key, url };
  }

  const prefixed = Object.keys(process.env)
    .filter((key) => PREFIXED_URL_RE.test(key) && readUrl(key))
    .sort((a, b) => {
      // `*_DATABASE_URL` dulu, lalu yang pooled sebelum non-pooled.
      const score = (key: string) =>
        (/_DATABASE_URL$/.test(key) ? 0 : 10) + (isNonPooled(key) ? 5 : 0);
      return score(a) - score(b) || a.length - b.length;
    });

  for (const key of prefixed) {
    const url = readUrl(key);
    if (url) return { key, url };
  }
  return null;
}

/** Nama-nama env var terkait database (TANPA nilainya) untuk diagnosis. */
export function databaseEnvKeys(): string[] {
  return Object.keys(process.env)
    .filter((key) => STANDARD_KEYS_SET.has(key) || PREFIXED_URL_RE.test(key))
    .sort();
}

/** Rapikan pesan error agar aman ditampilkan (tanpa kredensial). */
export function describeDatabaseError(error: unknown): string {
  // Drizzle membungkus error asli ("Failed query: ..."), sedangkan penyebab
  // sebenarnya (ECONNREFUSED, 28P01 password salah, ENOTFOUND, ...) ada di cause.
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const message =
      current instanceof Error
        ? current.message
        : typeof current === "string"
          ? current
          : "";
    const code = (current as { code?: unknown } | null)?.code;
    const detail = [message, typeof code === "string" ? `code ${code}` : ""]
      .filter(Boolean)
      .join(" — ");
    if (detail && !parts.includes(detail)) parts.push(detail);
    current = (current as { cause?: unknown } | null)?.cause;
  }

  const raw = parts.length ? parts.join(" ⟵ ") : "Kesalahan tidak dikenal.";
  return raw
    .replace(/postgres(ql)?:\/\/\S+/gi, "postgres://***")
    .replace(/(password=)[^&\s]+/gi, "$1***")
    .slice(0, 500);
}

/** TLS: hormati `sslmode` di URL, atau pakai TLS untuk host provider terkelola. */
function sslConfig(url: string) {
  const mode = /[?&]sslmode=([a-z-]+)/i.exec(url)?.[1]?.toLowerCase();
  if (mode === "disable" || mode === "allow" || mode === "prefer") return undefined;
  if (mode) return { rejectUnauthorized: false };
  if (/neon\.tech|supabase\.(co|com)|render\.com|vercel-storage\.com/i.test(url)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function createDb(): Database {
  const source = resolveDatabaseUrl();
  if (!source) {
    throw new Error(
      "Database belum dikonfigurasi: tidak ada DATABASE_URL / POSTGRES_URL " +
        "(atau env var berakhiran _DATABASE_URL seperti HIVE_DATABASE_URL). " +
        "Attach Postgres/Neon di Vercel → Storage → Connect Database, lalu Redeploy.",
    );
  }

  const pool =
    globalForDb.__hivecompPool ??
    new Pool({
      connectionString: source.url,
      // Serverless platforms open many short-lived workers — keep the pool small.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: sslConfig(source.url),
    });

  globalForDb.__hivecompPool = pool;
  globalForDb.__hivecompDb = drizzle(pool);
  return globalForDb.__hivecompDb;
}

function getDb(): Database {
  return globalForDb.__hivecompDb ?? createDb();
}

/** Drizzle client. Transparent proxy so no connection is opened at import time. */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
