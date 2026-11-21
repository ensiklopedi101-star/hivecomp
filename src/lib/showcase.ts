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

/**
 * Rapikan teks postingan: literal "\n" dari API, baris baru, dan spasi ganda
 * diratakan jadi satu spasi supaya kartu ringkas tidak menampilkan "\n".
 */
const cleanText = (v: unknown, fallback: string): string => {
  if (typeof v !== "string") return fallback;
  const normalized = v
    .replace(/\\+[rn]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized ? normalized.slice(0, 500) : fallback;
};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const empty = (reason: string): BrandFeed => ({ connected: false, reason, items: [] });

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
  const url = new URL(`${graphBase()}/${version}/${pageId}/posts`);
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
    text: cleanText(p.message, "(postingan tanpa teks)"),
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

/* ------------------------------------------------------------------
 * Backend PopBeez & NusaBeez (satu backend bersama)
 *
 * Kontrak (lihat docs/SHOWCASE-API.md):
 *   GET {POPNUSA_API_URL}/showcase?brand=popbeez&limit=3
 *   Authorization: Bearer {POPNUSA_API_TOKEN}
 *   200 → { "items": [ { id, text, url, image, publishedAt,
 *                        likes, comments, shares, views } ] }
 * Semua field angka boleh null — angka null tidak ditampilkan.
 * ------------------------------------------------------------------ */

const httpsUrl = (v: unknown): string => {
  if (typeof v !== "string") return "";
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
};

const count = (v: unknown): number | null => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

/** Ambil nilai pertama yang tersedia dari beberapa nama field (alias umum). */
const pick = (r: Record<string, unknown>, keys: string[]): unknown => {
  for (const k of keys) if (r[k] !== undefined && r[k] !== null && r[k] !== "") return r[k];
  return undefined;
};

/** Angka boleh polos, string angka, atau gaya Facebook ({summary:{total_count}} / {count}). */
const countOf = (v: unknown): number | null => {
  if (v && typeof v === "object") {
    const o = v as { summary?: { total_count?: unknown }; count?: unknown };
    return count(o.summary?.total_count ?? o.count);
  }
  return count(v);
};

/** Validasi ketat: item yang tidak memenuhi kontrak dibuang, tidak ditebak. */
export function parseBackendItems(payload: unknown): FeedItem[] {
  let list: unknown[] = [];
  if (Array.isArray(payload)) list = payload;
  else if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const found = [p.items, p.data, p.posts].find(Array.isArray);
    list = (found as unknown[] | undefined) ?? [];
  }
  const items: FeedItem[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const rawId = r.id;
    const id = typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : "";
    const rawText = pick(r, ["text", "message", "caption", "title"]);
    const text = typeof rawText === "string" ? cleanText(rawText, "") : "";
    const url = httpsUrl(pick(r, ["url", "permalink_url", "permalink", "link"]));
    if (!id || !text || !url) continue;
    const rawDate = pick(r, ["publishedAt", "published_at", "created_time", "created_at"]);
    const date = typeof rawDate === "string" && !Number.isNaN(Date.parse(rawDate)) ? rawDate : "";
    items.push({
      id,
      text,
      url,
      image: httpsUrl(pick(r, ["image", "full_picture", "image_url", "thumbnail"])),
      publishedAt: date,
      likes: countOf(pick(r, ["likes", "like_count", "likes_count", "reactions"])),
      comments: countOf(pick(r, ["comments", "comment_count", "comments_count"])),
      shares: countOf(pick(r, ["shares", "share_count", "shares_count"])),
      views: countOf(pick(r, ["views", "view_count", "views_count"])),
    });
    if (items.length === 3) break;
  }
  return items;
}

/** Panggil URL lengkap milik backend apa adanya (hanya menambah limit=3 bila belum ada). */
export async function backendFeedFromUrl(
  fullUrl: string,
  token: string,
  tokenEnv: string,
): Promise<BrandFeed> {
  let url: URL;
  try {
    url = new URL(fullUrl);
  } catch {
    return empty("URL backend tidak valid. Periksa nilai env URL-nya.");
  }
  if (!url.searchParams.has("limit")) url.searchParams.set("limit", "3");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(6000),
  });
  if (res.status === 401 || res.status === 403) return empty(`Backend menolak token. Periksa ${tokenEnv}.`);
  if (res.status === 404) return empty("Endpoint backend tidak ditemukan (404). Periksa URL-nya.");
  if (!res.ok) return empty(`Backend merespons ${res.status}.`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return empty("Backend tidak mengembalikan JSON.");
  }
  const items = parseBackendItems(json);
  if (items.length === 0) return empty("Backend terhubung, tetapi belum ada postingan yang valid.");
  return { connected: true, reason: "Terhubung ke backend (cache 5 menit)", items };
}

/** Mode URL dasar bersama: {base}/showcase?brand=... (tetap didukung). */
export async function backendFeed(
  baseUrl: string,
  token: string,
  brand: "popbeez" | "nusabeez",
): Promise<BrandFeed> {
  const url = new URL(baseUrl.replace(/\/+$/, "") + "/showcase");
  url.searchParams.set("brand", brand);
  return backendFeedFromUrl(url.toString(), token, "POPNUSA_API_TOKEN");
}

type BrandSource =
  | { kind: "url"; url: string; token: string; tokenEnv: string }
  | { kind: "base"; base: string; token: string }
  | { kind: "meta"; pageId: string; token: string }
  | { kind: "none" };

/** Prioritas per brand: URL lengkap per brand → URL dasar bersama → Meta → belum terhubung. */
export function resolveBrandSource(
  brand: "popbeez" | "nusabeez",
  env: Record<string, string | undefined> = process.env,
): BrandSource {
  const P = brand === "popbeez" ? "POPBEEZ" : "NUSABEEZ";
  const ownUrl = env[`${P}_API_URL`];
  const tokenEnv = [`${P}_API_TOKEN`, "POPNUSA_API_TOKEN", "POPBEEZ_API_TOKEN"].find((k) => env[k]);
  if (ownUrl && tokenEnv) return { kind: "url", url: ownUrl, token: env[tokenEnv]!, tokenEnv };
  if (env.POPNUSA_API_URL && env.POPNUSA_API_TOKEN)
    return { kind: "base", base: env.POPNUSA_API_URL, token: env.POPNUSA_API_TOKEN };
  const pageId = env[`META_PAGE_ID_${P}`];
  if (env.META_PAGE_TOKEN && pageId) return { kind: "meta", pageId, token: env.META_PAGE_TOKEN };
  return { kind: "none" };
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
      text: cleanText(i.snippet?.title, "(video tanpa judul)"),
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

/* ------------------------------------------------------------------
 * Instagram (akun profesional yang terhubung ke Page Facebook)
 *   GET {graph}/{ig-user-id}/media?fields=...   (instagram_basic)
 *   GET {graph}/{page-id}?fields=instagram_business_account
 * Atau dari backend sendiri: {BRAND}_INSTAGRAM_API_URL (format sama).
 * ------------------------------------------------------------------ */

const graphBase = () => (process.env.META_GRAPH_BASE || "https://graph.facebook.com").replace(/\/+$/, "");
const graphVersion = () => process.env.META_GRAPH_VERSION || "v26.0";

type IgMedia = {
  id?: unknown;
  caption?: unknown;
  media_type?: unknown;
  media_url?: unknown;
  thumbnail_url?: unknown;
  permalink?: unknown;
  timestamp?: unknown;
  like_count?: unknown;
  comments_count?: unknown;
};

/** Validasi ketat: item tanpa id / permalink https dibuang; angka yang tidak ada tetap null. */
export function parseInstagramMedia(payload: unknown): FeedItem[] {
  const list =
    payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: unknown[] }).data)
      : [];
  const items: FeedItem[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as IgMedia;
    const id = typeof m.id === "string" || typeof m.id === "number" ? String(m.id) : "";
    const url = httpsUrl(m.permalink);
    if (!id || !url) continue;
    const caption = typeof m.caption === "string" ? m.caption.trim().slice(0, 500) : "";
    const isVideo = m.media_type === "VIDEO";
    const image = isVideo ? httpsUrl(m.thumbnail_url) || httpsUrl(m.media_url) : httpsUrl(m.media_url) || httpsUrl(m.thumbnail_url);
    const ts = typeof m.timestamp === "string" && !Number.isNaN(Date.parse(m.timestamp)) ? m.timestamp : "";
    items.push({
      id,
      text: cleanText(caption, "(postingan tanpa teks)"),
      url,
      image,
      publishedAt: ts,
      likes: count(m.like_count),
      comments: count(m.comments_count),
      shares: null,
      views: null,
    });
    if (items.length === 3) break;
  }
  return items;
}

export async function instagramFeed(igUserId: string, token: string): Promise<BrandFeed> {
  const url = new URL(`${graphBase()}/${graphVersion()}/${igUserId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count");
  url.searchParams.set("limit", "3");
  url.searchParams.set("access_token", token);
  const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) });
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    return empty("Instagram menolak permintaan. Periksa token, izin instagram_basic, dan tautan akun ke Page.");
  }
  if (!res.ok) return empty(`Instagram API merespons ${res.status}.`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return empty("Instagram API tidak mengembalikan JSON.");
  }
  const items = parseInstagramMedia(json);
  if (items.length === 0) return empty("Akun Instagram terhubung, tetapi belum ada postingan yang dapat dibaca.");
  return { connected: true, reason: "Terhubung ke Instagram Graph API (cache 5 menit)", items };
}

async function resolveIgUserId(pageId: string, token: string): Promise<string | null> {
  const url = new URL(`${graphBase()}/${graphVersion()}/${pageId}`);
  url.searchParams.set("fields", "instagram_business_account");
  url.searchParams.set("access_token", token);
  const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const j = (await res.json()) as { instagram_business_account?: { id?: unknown } };
  const id = j.instagram_business_account?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

type IgSource =
  | { kind: "url"; url: string; token: string; tokenEnv: string }
  | { kind: "id"; igId: string; token: string }
  | { kind: "page"; pageId: string; token: string }
  | { kind: "none" };

/** Prioritas: backend sendiri → ID akun Instagram → cari lewat Page → tidak ada. */
export function resolveInstagramSource(
  brand: "popbeez" | "nusabeez",
  env: Record<string, string | undefined> = process.env,
): IgSource {
  const P = brand === "popbeez" ? "POPBEEZ" : "NUSABEEZ";
  const ownUrl = env[`${P}_INSTAGRAM_API_URL`];
  const tokenEnv = [`${P}_API_TOKEN`, "POPNUSA_API_TOKEN", "POPBEEZ_API_TOKEN"].find((k) => env[k]);
  if (ownUrl && tokenEnv) return { kind: "url", url: ownUrl, token: env[tokenEnv]!, tokenEnv };
  const token = env.META_PAGE_TOKEN;
  const igId = env[`META_IG_USER_ID_${P}`];
  if (token && igId) return { kind: "id", igId, token };
  const pageId = env[`META_PAGE_ID_${P}`];
  if (token && pageId) return { kind: "page", pageId, token };
  return { kind: "none" };
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
  const token = process.env.META_PAGE_TOKEN;
  const popId = process.env.META_PAGE_ID_POPBEEZ;
  const nusaId = process.env.META_PAGE_ID_NUSABEEZ;
  const ytKey = process.env.YOUTUBE_API_KEY;
  const ytChannel = process.env.YOUTUBE_CHANNEL_ID_BLINKBEEZ;
  const popSource = resolveBrandSource("popbeez");
  const nusaSource = resolveBrandSource("nusabeez");
  const describe = (s: BrandSource) =>
    s.kind === "url" ? `url:${s.url}` : s.kind === "base" ? `base:${s.base}` : s.kind === "meta" ? `meta:${s.pageId}` : "none";

  const igPopSrc = resolveInstagramSource("popbeez");
  const igNusaSrc = resolveInstagramSource("nusabeez");
  const describeIg = (x: IgSource) =>
    x.kind === "url" ? `igurl:${x.url}` : x.kind === "id" ? `igid:${x.igId}` : x.kind === "page" ? `igpage:${x.pageId}` : "ig-none";

  const keySignature = [
    describe(popSource),
    describe(nusaSource),
    describeIg(igPopSrc),
    describeIg(igNusaSrc),
    Boolean(token),
    popId ?? "",
    nusaId ?? "",
    Boolean(ytKey),
    ytChannel ?? "",
  ].join("|");

  const pageFeed = (brand: "popbeez" | "nusabeez", source: BrandSource, label: string) => {
    switch (source.kind) {
      case "url":
        return safe(true, "", () => backendFeedFromUrl(source.url, source.token, source.tokenEnv));
      case "base":
        return safe(true, "", () => backendFeed(source.base, source.token, brand));
      case "meta":
        return safe(true, "", () => metaFeed(source.pageId, source.token));
      default:
        return safe(false, `Konektor untuk ${label} belum dikonfigurasi.`, async () => empty(""));
    }
  };

  const now = Date.now();
  const cached = globalCache.__hiveShowcaseCache;
  if (cached && cached.keySignature === keySignature && cached.expiresAt > now) {
    return cached.data;
  }

  const igFeed = (src: IgSource): Promise<BrandFeed> | null => {
    switch (src.kind) {
      case "url":
        return safe(true, "", () => backendFeedFromUrl(src.url, src.token, src.tokenEnv));
      case "id":
        return safe(true, "", () => instagramFeed(src.igId, src.token));
      case "page":
        return safe(true, "", async () => {
          const id = await resolveIgUserId(src.pageId, src.token);
          return id ? instagramFeed(id, src.token) : empty("Page belum terhubung ke akun Instagram profesional.");
        });
      default:
        return null;
    }
  };

  const [popbeez, nusabeez, blinkbeez, igPop, igNusa] = await Promise.all([
    pageFeed("popbeez", popSource, "PopBeez"),
    pageFeed("nusabeez", nusaSource, "NusaBeez"),
    safe(!!ytKey && !!ytChannel, "Kanal BlinkBeez belum dihubungkan.", () =>
      youtubeFeed(ytChannel!, ytKey!),
    ),
    igFeed(igPopSrc) ?? Promise.resolve(null),
    igFeed(igNusaSrc) ?? Promise.resolve(null),
  ]);

  const instagram: NonNullable<ShowcaseData["instagram"]> = {};
  if (igPop) instagram.popbeez = igPop;
  if (igNusa) instagram.nusabeez = igNusa;

  const data: ShowcaseData = { popbeez, nusabeez, blinkbeez, instagram };
  globalCache.__hiveShowcaseCache = {
    expiresAt: now + CACHE_TTL_MS,
    keySignature,
    data,
  };
  return data;
}
