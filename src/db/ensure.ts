import { sql } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { SAMPLE_ARTICLES } from "@/lib/shared";

/**
 * Zero-config bootstrap for a fresh Postgres database (Neon/Vercel Postgres).
 * Creates tables if missing and seeds Portal-Hub demo content once.
 * Safe to call from every route — runs only once per serverless instance.
 */
let ready: Promise<void> | null = null;

// Arbitrary but stable key for pg_advisory_xact_lock — memastikan dua cold
// start yang bersamaan tidak membuat tabel/seed secara balapan.
const LOCK_KEY = 791_97_61;

async function bootstrap(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${LOCK_KEY})`);

    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS leads (
        id serial PRIMARY KEY,
        name varchar(120) NOT NULL,
        contact varchar(160) NOT NULL,
        interest varchar(80) NOT NULL,
        message text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        key varchar(40) PRIMARY KEY,
        value jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await tx.execute(sql`
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

    // Index unik ini hanya "bonus" idempoten untuk seeding. Kalau database
    // lama sudah berisi judul duplikat, CREATE INDEX akan gagal — jangan
    // sampai menggagalkan seluruh bootstrap.
    await tx.execute(sql`
      DO $$
      BEGIN
        BEGIN
          CREATE UNIQUE INDEX IF NOT EXISTS articles_title_unique ON articles (title);
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'articles_title_unique dilewati: %', SQLERRM;
        END;
      END
      $$
    `);

    // Seed hanya saat tabel benar-benar kosong. Lock advisory di atas
    // memastikan tidak ada dua cold start yang menyisipkan data bersamaan.
    const existing = await tx.select({ id: articles.id }).from(articles).limit(1);
    if (existing.length === 0) {
      await tx.insert(articles).values(
        SAMPLE_ARTICLES.map((a, i) => ({
          title: a.title,
          category: a.category,
          excerpt: a.excerpt,
          imageUrl: a.imageUrl,
          source: a.source,
          createdAt: new Date(Date.now() - i * 3_600_000),
        })),
      );
    }
  });
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
