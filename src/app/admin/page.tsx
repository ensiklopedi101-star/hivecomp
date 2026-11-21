import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { articles, connectorGuidance, leads } from "@/db/schema";
import { isAdmin, usingDefaultPassword } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { buildPreflight, PREFLIGHT_NOTES } from "@/lib/preflight";
import { formatDate, type ArticleDTO, type LeadDTO } from "@/lib/content";
import type { ConnectorGuidanceRow } from "@/lib/connector-guidance-types";
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

  await ensureSchema();
  const [siteSettings, leadRows, articleRows, guidanceRows] = await Promise.all([
    getSettings(),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100),
    db.select().from(articles).orderBy(desc(articles.createdAt)).limit(200),
    db.select().from(connectorGuidance).catch(() => []),
  ]);

  const guidanceDTOs: ConnectorGuidanceRow[] = guidanceRows.map((g) => ({
    id: g.id,
    brand: g.brand,
    method: g.method,
    summary: g.summary,
    steps: g.steps,
    credentials: g.credentials,
    tradeoffs: g.tradeoffs,
  }));

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
      guidance={guidanceDTOs}
      checks={buildPreflight(siteSettings, !usingDefaultPassword())}
      notes={PREFLIGHT_NOTES}
    />
  );
}
