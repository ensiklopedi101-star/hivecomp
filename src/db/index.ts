import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Works locally and on Vercel:
// - Local sandbox provides DATABASE_URL.
// - Vercel Postgres / Neon / Supabase provide DATABASE_URL or POSTGRES_URL.
//
// The pool is created lazily on the FIRST query. This keeps `next build`
// working even when no database env var is present yet (e.g. someone deploys
// before attaching the Vercel Postgres integration).
type Database = NodePgDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __hivecompPool?: Pool;
  __hivecompDb?: Database;
};

function getDb(): Database {
  if (globalForDb.__hivecompDb) return globalForDb.__hivecompDb;

  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is required — attach Vercel Postgres in your project settings.",
    );
  }

  const pool =
    globalForDb.__hivecompPool ??
    new Pool({
      connectionString: databaseUrl,
      // Serverless platforms open many short-lived workers — keep the pool small.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      // Required by hosted Postgres providers that use TLS.
      ssl: /sslmode=require/.test(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
    });

  globalForDb.__hivecompPool = pool;
  globalForDb.__hivecompDb = drizzle(pool);
  return globalForDb.__hivecompDb;
}

/** Drizzle client. Transparent proxy so no connection is opened at import time. */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
