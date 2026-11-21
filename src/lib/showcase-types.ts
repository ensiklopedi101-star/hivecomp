/** Shared shapes for the landing page showcase (client + server safe). */
export type FeedItem = {
  id: string;
  text: string;
  url: string;
  image: string;
  publishedAt: string;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  views: number | null;
};

export type BrandFeed = {
  connected: boolean;
  reason: string;
  items: FeedItem[];
};

export type ShowcaseData = {
  popbeez: BrandFeed;
  nusabeez: BrandFeed;
  blinkbeez: BrandFeed;
  /** Postingan Instagram — hanya ada bila sumbernya dikonfigurasi. */
  instagram?: Partial<Record<"popbeez" | "nusabeez", BrandFeed>>;
};
