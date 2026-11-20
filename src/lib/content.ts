import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { articles } from "@/db/schema";
import { formatDate, SAMPLE_ARTICLES, type ArticleDTO } from "./shared";

export * from "./shared";

/** Latest articles from DB; falls back to built-in samples when empty/offline. */
export async function getArticles(): Promise<ArticleDTO[]> {
  try {
    await ensureSchema();
    const rows = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(120);
    if (rows.length === 0) return SAMPLE_ARTICLES;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      excerpt: r.excerpt,
      imageUrl: r.imageUrl,
      source: r.source,
      dateLabel: formatDate(r.createdAt),
    }));
  } catch {
    return SAMPLE_ARTICLES;
  }
}
