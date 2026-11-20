import type { BrandFeed, FeedItem, ShowcaseData } from "./showcase-types";

/**
 * Server-side connector for the landing page showcase with 5-minute TTL cache.
 *
 * Caching is critical because YouTube `search.list` consumes 100 quota units
 * per call (out of 10,000 daily units). With a 5-minute cache, traffic spikes
 * never exhaust daily API quotas.
 *
 * SENGAJA TIDAK mengembalikan data contoh. Bila konektor belum dikonfigurasi
 * atau gagal, statusnya "belum terhubung" dan UI hanya menampilkan CTA.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const globalCache = globalThis as typeof globalThis & {
  __hiveShowcaseCache?: {
    expiresAt: number;
    keySignature: string;
    data: ShowcaseData;
  };
};

type PagePost = {
  id?: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
  reactions?: { summary?: { total_count?: number } };
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
  shares?: { count?: number };
};

type YtSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
  };
};
type YtVideo = {
  id?: string;
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const empty = (reason: string): BrandFeed => ({ connected: false, reason, items: [] });

/**
 * Custom connector to PopBeez & NusaBeez shared backend system.
 * Very reliable, bypasses Meta Graph API rate limits and token expirations.
 */
async function backendFeed(
  brand: "popbeez" | "nusabeez",
  backendUrl: string,
  apiKey?: string,
): Promise<BrandFeed> {
  try {
    const url = new URL(backendUrl);
    if (!url.searchParams.has("brand")) {
      url.searchParams.set("brand", brand);
    }
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers,
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return empty(`Backend ${brand} merespons HTTP ${res.status}.`);
    }

    const rawJson = (await res.json()) as unknown;
    let list: unknown[] = [];
    if (Array.isArray(rawJson)) {
      list = rawJson;
    } else if (rawJson && typeof rawJson === "object") {
      const obj = rawJson as Record<string, unknown>;
      if (Array.isArray(obj[brand])) {
        list = obj[brand] as unknown[];
      } else if (Array.isArray(obj.data)) {
        list = obj.data;
      } else if (Array.isArray(obj.items)) {
        list = obj.items;
      } else if (Array.isArray(obj.posts)) {
        list = obj.posts;
      }
    }

    if (!list.length) {
      return empty(`Belum ada data postingan ${brand} dari backend.`);
    }

    const items: FeedItem[] = list.slice(0, 3).map((item, idx) => {
      const it = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
      return {
        id: String(it.id ?? it._id ?? `${brand}-${idx}`),
        text: String(it.text ?? it.caption ?? it.title ?? it.message ?? "(postingan)"),
        url: String(it.url ?? it.link ?? it.permalink ?? ""),
        image: String(it.image ?? it.imageUrl ?? it.thumbnail ?? it.picture ?? ""),
        publishedAt: String(it.publishedAt ?? it.date ?? it.createdAt ?? ""),
        likes: num(it.likes ?? it.likeCount ?? it.reactions),
        comments: num(it.comments ?? it.commentCount),
        shares: num(it.shares ?? it.shareCount),
        views: num(it.views ?? it.viewCount),
      };
    });

    return {
      connected: true,
      reason: `Terhubung ke backend ${brand} (cache 5 menit)`,
      items,
    };
  } catch (err) {
    return empty(`Gagal menghubungi backend ${brand}: ${err instanceof Error ? err.message : "koneksi terputus"}`);
  }
}

async function metaFeed(pageId: string, token: string): Promise<BrandFeed> {
  const version = process.env.META_GRAPH_VERSION || "v26.0";
  const fields = [
    "id",
    "message",
    "created_time",
    "permalink_url",
    "full_picture",
    "shares",
    "reactions.limit(0).summary(true)",
    "comments.limit(0).summary(true)",
  ].join(",");
  const url = new URL(`https://graph.facebook.com/${version}/${pageId}/posts`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "3");
  url.searchParams.set("access_token", token);

  const res = await fetch(url, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return empty("Meta Graph API menolak permintaan. Periksa token & izin Page.");
  const posts = ((await res.json()) as { data?: PagePost[] }).data ?? [];
  if (posts.length === 0) return empty("Belum ada postingan yang dapat dibaca.");

  const items: FeedItem[] = posts.map((p) => ({
    id: p.id ?? "",
    text: p.message ?? "(postingan tanpa teks)",
    url: p.permalink_url ?? "",
    image: p.full_picture ?? "",
    publishedAt: p.created_time ?? "",
    likes: num(p.reactions?.summary?.total_count ?? p.likes?.summary?.total_count),
    comments: num(p.comments?.summary?.total_count),
    shares: num(p.shares?.count),
    views: null,
  }));
  return { connected: true, reason: "Terhubung ke Meta Graph API (cache 5 menit)", items };
}

async function youtubeFeed(channelId: string, key: string): Promise<BrandFeed> {
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("channelId", channelId);
  searchUrl.searchParams.set("order", "date");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoDuration", "short");
  searchUrl.searchParams.set("maxResults", "3");
  searchUrl.searchParams.set("key", key);

  const searchRes = await fetch(searchUrl, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(6000),
  });
  if (!searchRes.ok) return empty("YouTube Data API menolak permintaan. Periksa API key & kuota.");
  const found = (((await searchRes.json()) as { items?: YtSearchItem[] }).items ?? []).filter(
    (i) => i.id?.videoId,
  );
  if (found.length === 0) return empty("Belum ada Shorts yang dapat dibaca.");

  let stats: YtVideo[] = [];
  try {
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics");
    statsUrl.searchParams.set("id", found.map((i) => i.id?.videoId ?? "").join(","));
    statsUrl.searchParams.set("key", key);
    const statsRes = await fetch(statsUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (statsRes.ok) stats = ((await statsRes.json()) as { items?: YtVideo[] }).items ?? [];
  } catch {
    // Statistics are optional — titles/thumbnails are still real data.
  }

  const items: FeedItem[] = found.map((i) => {
    const id = i.id?.videoId ?? "";
    const s = stats.find((v) => v.id === id)?.statistics;
    return {
      id,
      text: i.snippet?.title ?? "(video tanpa judul)",
      url: `https://www.youtube.com/watch?v=${id}`,
      image: i.snippet?.thumbnails?.medium?.url ?? i.snippet?.thumbnails?.high?.url ?? "",
      publishedAt: i.snippet?.publishedAt ?? "",
      likes: s?.likeCount ? Number(s.likeCount) : null,
      comments: s?.commentCount ? Number(s.commentCount) : null,
      shares: null,
      views: s?.viewCount ? Number(s.viewCount) : null,
    };
  });
  return { connected: true, reason: "Terhubung ke YouTube Data API (cache 5 menit)", items };
}

async function safe(
  configured: boolean,
  reason: string,
  run: () => Promise<BrandFeed>,
): Promise<BrandFeed> {
  if (!configured) return empty(reason);
  try {
    return await run();
  } catch {
    return empty("Koneksi ke sumber data gagal. Coba lagi nanti.");
  }
}

export async function getShowcaseData(): Promise<ShowcaseData> {
  const backendUrl = process.env.POPNUSA_BACKEND_URL;
  const backendKey = process.env.POPNUSA_API_KEY;

  const token = process.env.META_PAGE_TOKEN;
  const popId = process.env.META_PAGE_ID_POPBEEZ;
  const nusaId = process.env.META_PAGE_ID_NUSABEEZ;
  const ytKey = process.env.YOUTUBE_API_KEY;
  const ytChannel = process.env.YOUTUBE_CHANNEL_ID_BLINKBEEZ;

  const keySignature = [
    backendUrl ?? "",
    Boolean(backendKey),
    Boolean(token),
    popId ?? "",
    nusaId ?? "",
    Boolean(ytKey),
    ytChannel ?? "",
  ].join("|");

  const now = Date.now();
  const cached = globalCache.__hiveShowcaseCache;
  if (cached && cached.keySignature === keySignature && cached.expiresAt > now) {
    return cached.data;
  }

  const popRunner = backendUrl
    ? () => backendFeed("popbeez", backendUrl, backendKey)
    : () => metaFeed(popId!, token!);

  const nusaRunner = backendUrl
    ? () => backendFeed("nusabeez", backendUrl, backendKey)
    : () => metaFeed(nusaId!, token!);

  const [popbeez, nusabeez, blinkbeez] = await Promise.all([
    safe(
      Boolean(backendUrl || (token && popId)),
      "Konektor backend PopBeez (POPNUSA_BACKEND_URL) atau Meta belum dikonfigurasi.",
      popRunner,
    ),
    safe(
      Boolean(backendUrl || (token && nusaId)),
      "Konektor backend NusaBeez (POPNUSA_BACKEND_URL) atau Meta belum dikonfigurasi.",
      nusaRunner,
    ),
    safe(!!ytKey && !!ytChannel, "Kanal BlinkBeez belum dihubungkan.", () =>
      youtubeFeed(ytChannel!, ytKey!),
    ),
  ]);

  const data: ShowcaseData = { popbeez, nusabeez, blinkbeez };
  globalCache.__hiveShowcaseCache = {
    expiresAt: now + CACHE_TTL_MS,
    keySignature,
    data,
  };
  return data;
}
