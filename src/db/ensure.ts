import { sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, connectorGuidance } from "@/db/schema";
import { SAMPLE_ARTICLES } from "@/lib/shared";

type GuidanceRow = typeof connectorGuidance.$inferInsert;

const GUIDANCE: GuidanceRow[] = [
  {
    brand: "popbeez",
    method: "Meta Graph API",
    summary:
      "Ambil langsung dari Facebook Page PopBeez. Paling cepat dipakai bila Page sudah punya token dan izin baca engagement.",
    steps:
      "1) Buat app di developers.facebook.com; 2) aktifkan pages_show_list dan pages_read_engagement; 3) ambil Page access token melalui /me/accounts; 4) simpan token sebagai META_PAGE_TOKEN, META_PAGE_ID_POPBEEZ di Vercel; 5) baca /{page_id}/posts dengan fields=message,created_time,permalink_url,full_picture,reactions.summary(true),comments.summary(true).",
    credentials: "META_PAGE_TOKEN; META_PAGE_ID_POPBEEZ; META_PAGE_ID_NUSABEEZ; META_GRAPH_VERSION",
    tradeoffs:
      "Kelebihan: tidak perlu membaca backend Pop/Nusa. Kekurangan: akses Page Insights butuh izin tambahan; token harus disimpan sebagai secret server; setiap perubahan kebijakan Meta harus diikuti.",
  },
  {
    brand: "popbeez",
    method: "Backend PopBeez & NusaBeez (satu backend bersama)",
    summary:
      "Bila backend Anda sudah menyimpan postingan dan interaksi, landing page cukup membaca endpoint internal. Biasanya lebih stabil daripada bergantung ke kuota platform.",
    steps:
      "1) Sediakan satu endpoint GET read-only via HTTPS, mis. /api/pages/popbeez/posts; 2) wajibkan header Authorization: Bearer {TOKEN}; 3) balas JSON { items: [ { id, text, url, image, publishedAt, likes, comments, shares, views } ] } terbaru dulu, < 6 detik; 4) di Vercel set POPBEEZ_API_URL (URL lengkap, mis. https://backend-anda.com/api/pages/popbeez/posts) dan POPBEEZ_API_TOKEN lalu redeploy; 5) cek /api/showcase → popbeez.connected harus true. Kontrak lengkap: docs/SHOWCASE-API.md.",
    credentials: "POPBEEZ_API_URL / NUSABEEZ_API_URL (URL lengkap); POPBEEZ_API_TOKEN (Bearer, opsional NUSABEEZ_API_TOKEN). Hanya di env server Vercel, tidak pernah ke browser.",
    tradeoffs:
      "Kelebihan: satu sumber untuk dua brand; kontrol data penuh. Kekurangan: perlu kontrak API; jika endpoint belum ada, harus dibuat di backend Anda lebih dulu.",
  },
  {
    brand: "nusabeez",
    method: "Meta Graph API",
    summary:
      "Sama seperti PopBeez: baca Page NusaBeez langsung melalui Meta. Cocok bila hanya butuh tampilan postingan dan jumlah interaksi publik.",
    steps:
      "1) Siapkan Page access token NusaBeez; 2) set META_PAGE_ID_NUSABEEZ; 3) panggil /{page_id}/posts dengan limit kecil; 4) uji /api/showcase untuk memastikan connected:true; 5) periksa apakah butuh pages_read_engagement untuk konten Page.",
    credentials: "META_PAGE_TOKEN; META_PAGE_ID_NUSABEEZ; META_GRAPH_VERSION",
    tradeoffs:
      "Kelebihan: langsung dari sumber resmi. Kekurangan: kuota dan aturan Meta berubah; reach/impressions tidak otomatis tersedia tanpa izin Insights.",
  },
  {
    brand: "nusabeez",
    method: "Backend PopBeez & NusaBeez (satu backend bersama)",
    summary:
      "Bila backend bersama menyimpan data NusaBeez, gunakan endpoint yang sama dengan PopBeez dengan parameter page/brand. Ini pilihan paling efisien untuk satu grup.",
    steps:
      "1) Sediakan endpoint NusaBeez, mis. /api/pages/nusabeez/posts, dengan format JSON yang sama; 2) set NUSABEEZ_API_URL di Vercel; 3) token boleh sama — bila NUSABEEZ_API_TOKEN kosong, POPBEEZ_API_TOKEN dipakai; 4) bila backend gagal / item kosong, panel NusaBeez tampil Belum terhubung tanpa angka contoh.",
    credentials: "POPBEEZ_API_URL / NUSABEEZ_API_URL (URL lengkap); POPBEEZ_API_TOKEN (Bearer, opsional NUSABEEZ_API_TOKEN). Hanya di env server Vercel, tidak pernah ke browser.",
    tradeoffs:
      "Kelebihan: satu integrasi melayani dua Page. Kekurangan: bergantung pada ketersediaan backend Anda; perlu koordinasi bila backend berubah.",
  },
  ...(["popbeez", "nusabeez"] as const).map(
    (brand): GuidanceRow => ({
      brand,
      method: "Instagram Graph API (Meta)",
      summary:
        "Tampilkan 3 postingan Instagram terbaru sebagai tab di panel Showcase. Tombol Instagram sendiri sudah aktif begitu alamat akunnya diisi di Tampilan & URL — bagian ini hanya untuk menampilkan postingan.",
      steps:
        "1) Akun Instagram harus Profesional (Business/Creator) dan terhubung ke Page Facebook yang sesuai; 2) pakai Page access token yang sama dengan jalur Meta, dengan izin instagram_basic + pages_show_list/pages_read_engagement; 3) set META_PAGE_TOKEN dan META_PAGE_ID_" +
        brand.toUpperCase() +
        " di Vercel (ID akun Instagram dicari otomatis dari Page) — atau set META_IG_USER_ID_" +
        brand.toUpperCase() +
        " bila sudah tahu ID-nya; 4) Redeploy; 5) buka /api/showcase → instagram." +
        brand +
        ".connected harus true. Alternatif: backend sendiri lewat " +
        brand.toUpperCase() +
        "_INSTAGRAM_API_URL dengan format respons yang sama seperti postingan Facebook.",
      credentials:
        "META_PAGE_TOKEN; META_PAGE_ID_" + brand.toUpperCase() + " atau META_IG_USER_ID_" + brand.toUpperCase() + ". Hanya di env server Vercel.",
      tradeoffs:
        "Kelebihan: resmi dan tidak perlu menyentuh backend. Kekurangan: izin instagram_basic umumnya butuh App Review bila dipakai di luar akun Anda sendiri; akun pribadi (non-profesional) tidak bisa dibaca; jumlah suka bisa kosong bila disembunyikan pemilik akun — dalam kasus itu angkanya tidak ditampilkan.",
    }),
  ),
];

/**
 * Zero-config bootstrap for a fresh Vercel Postgres database.
 * Creates tables if missing and seeds Portal-Hub demo content once.
 * Safe to call from every route — runs only once per serverless instance.
 */
let ready: Promise<void> | null = null;

// Arbitrary but stable key for pg_advisory_xact_lock — mencegah dua cold start
// bersamaan membuat tabel/seed secara balapan.
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

    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS connector_guidance (
        id serial PRIMARY KEY,
        brand varchar(40) NOT NULL,
        method varchar(120) NOT NULL,
        summary text NOT NULL,
        steps text NOT NULL,
        credentials text NOT NULL,
        tradeoffs text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Index unik ini hanya "bonus" idempoten untuk seeding. Kalau database lama
    // sudah berisi duplikat, CREATE INDEX akan gagal — jangan sampai
    // menggagalkan seluruh bootstrap.
    await tx.execute(sql`
      DO $$
      BEGIN
        BEGIN
          CREATE UNIQUE INDEX IF NOT EXISTS articles_title_unique ON articles (title);
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'articles_title_unique dilewati: %', SQLERRM;
        END;
        BEGIN
          CREATE UNIQUE INDEX IF NOT EXISTS connector_guidance_brand_method_unique
          ON connector_guidance (brand, method);
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'connector_guidance_brand_method_unique dilewati: %', SQLERRM;
        END;
      END
      $$
    `);

    await tx
      .insert(connectorGuidance)
      .values(GUIDANCE)
      .onConflictDoUpdate({
        target: [connectorGuidance.brand, connectorGuidance.method],
        set: {
          summary: sql`excluded.summary`,
          steps: sql`excluded.steps`,
          credentials: sql`excluded.credentials`,
          tradeoffs: sql`excluded.tradeoffs`,
        },
      });

    // Seed artikel demo hanya saat tabel benar-benar kosong. Lock advisory di
    // atas memastikan tidak ada dua cold start yang menyisipkan bersamaan.
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
