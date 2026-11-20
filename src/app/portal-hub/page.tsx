import type { Metadata } from "next";
import { getArticles } from "@/lib/content";
import PortalApp from "@/components/portal-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal-Hub (Prototipe) — Agregator Berita | HiveComp",
  description:
    "Prototipe Portal-Hub: agregator berita nasional, hiburan, ekonomi, olahraga, teknologi, dan lifestyle. Bukan situs produksi portal-hub.online.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const articles = await getArticles();
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return <PortalApp articles={articles} today={today} />;
}
