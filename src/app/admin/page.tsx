import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db, describeDatabaseError } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { articles, leads } from "@/db/schema";
import { isAdmin, usingDefaultPassword } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { buildPreflight, PREFLIGHT_NOTES } from "@/lib/preflight";
import { formatDate, type ArticleDTO, type LeadDTO } from "@/lib/content";
import AdminLogin from "@/components/admin-login";
import AdminDashboard from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel Admin — HiveComp",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin showDefaultHint={usingDefaultPassword()} />;
  }

  // Panel admin tidak boleh ikut mati hanya karena query database gagal.
  // getSettings() sudah punya fallback internal; lead & artikel di-fetch
  // defensif, dan pesan error ditampilkan di dashboard.
  let leadRows: (typeof leads.$inferSelect)[] = [];
  let articleRows: (typeof articles.$inferSelect)[] = [];
  let dbError = "";

  try {
    await ensureSchema();
    const [l, a] = await Promise.all([
      db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100),
      db.select().from(articles).orderBy(desc(articles.createdAt)).limit(200),
    ]);
    leadRows = l;
    articleRows = a;
  } catch (error) {
    dbError = describeDatabaseError(error);
  }

  const siteSettings = await getSettings();

  const leadDTOs: LeadDTO[] = leadRows.map((l) => ({
    id: l.id,
    name: l.name,
    contact: l.contact,
    interest: l.interest,
    message: l.message,
    dateLabel: formatDate(l.createdAt),
  }));

  const articleDTOs: ArticleDTO[] = articleRows.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    excerpt: a.excerpt,
    imageUrl: a.imageUrl,
    source: a.source,
    dateLabel: formatDate(a.createdAt),
  }));

  return (
    <AdminDashboard
      initialSettings={siteSettings}
      leads={leadDTOs}
      articles={articleDTOs}
      checks={buildPreflight(siteSettings, !usingDefaultPassword())}
      notes={PREFLIGHT_NOTES}
      dbError={dbError}
    />
  );
}
