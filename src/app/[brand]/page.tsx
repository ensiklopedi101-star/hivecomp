import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRANDS, type BrandSlug } from "@/lib/brands";
import { getSettings } from "@/lib/settings";
import { getArticles } from "@/lib/content";
import BrandPage from "@/components/brand-page";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand } = await params;
  const info = BRANDS[brand as BrandSlug];
  if (!info) return { title: "Tidak ditemukan — HiveComp" };
  return {
    title: `${info.name} (Prototipe) — HiveComp`,
    description: info.tagline,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Params) {
  const { brand } = await params;
  const info = BRANDS[brand as BrandSlug];
  // Portal-Hub has its own dedicated route (/portal-hub).
  if (!info || brand === "portal-hub") notFound();

  const [s, all] = await Promise.all([getSettings(), getArticles()]);
  const articles = info.category
    ? all.filter((a) => a.category === info.category)
    : all;

  return <BrandPage brand={info} url={s.urls[info.slug]} articles={articles} />;
}
