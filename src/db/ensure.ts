import { sql } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { SAMPLE_ARTICLES } from "@/lib/shared";

/**
 * Zero-config bootstrap for a fresh Vercel Postgres database.
 * Creates tables if missing and seeds Portal-Hub demo content once.
 * Safe to call from every route — runs only once per serverless instance.
 */
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS leads (
      id serial PRIMARY KEY,
      name varchar(120) NOT NULL,
      contact varchar(160) NOT NULL,
      interest varchar(80) NOT NULL,
      message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS settings (
      key varchar(40) PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS articles (
      id serial PRIMARY KEY,
      title varchar(220) NOT NULL,
      category varchar(40) NOT NULL,
      excerpt text NOT NULL,
      image_url text NOT NULL DEFAULT '',
      source varchar(120) NOT NULL DEFAULT 'Portal-Hub',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  // Makes demo seeding idempotent even if several cold starts race.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS articles_title_unique ON articles (title)
  `);

  await db
    .insert(articles)
    .values(
      SAMPLE_ARTICLES.map((a, i) => ({
        title: a.title,
        category: a.category,
        excerpt: a.excerpt,
        imageUrl: a.imageUrl,
        source: a.source,
        createdAt: new Date(Date.now() - i * 3_600_000),
      })),
    )
    .onConflictDoNothing({ target: articles.title });
}

export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = bootstrap().catch((error) => {
      // Allow a later request to retry (e.g. transient DB cold start).
      ready = null;
      throw error;
    });
  }
  return ready;
}
