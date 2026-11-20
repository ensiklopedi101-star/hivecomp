import { Globe, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import {
  formatCount,
  pseudoComments,
  pseudoLikes,
  pseudoShares,
  type ArticleDTO,
} from "@/lib/shared";

/** Facebook-style news card — the format PopBeez & NusaBeez publish daily. */
export default function NewsCard({
  article,
  brandName,
  brandColor,
}: {
  article: ArticleDTO;
  brandName: string;
  brandColor: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-xl shadow-black/40 transition-transform duration-500 hover:-translate-y-1">
      <div className="flex items-center gap-2.5">
        <span className="clip-hex h-9 w-9 shrink-0" style={{ background: brandColor }} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-100">{brandName}</p>
          <p className="flex items-center gap-1 font-mono text-[10px] text-stone-500">
            {article.dateLabel} · <Globe className="h-2.5 w-2.5" />
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-medium text-portal">
          Ikuti
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-stone-300">
        {article.title}
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
        {article.imageUrl ? (
          <div className="relative aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <span
                className="font-mono text-[9px] uppercase tracking-[0.3em]"
                style={{ color: brandColor }}
              >
                {brandName} · News Card
              </span>
              <p className="mt-1 line-clamp-2 font-display text-sm font-bold uppercase leading-tight text-white">
                {article.title}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex aspect-[2/1] flex-col justify-end p-3.5"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${brandColor} 55%, #111113), #111113)`,
            }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/70">
              {brandName} · News Card
            </span>
            <p className="mt-1 line-clamp-2 font-display text-sm font-bold uppercase leading-tight text-white">
              {article.title}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-stone-500">
        <span className="flex items-center gap-1.5 text-[11px]">
          <ThumbsUp className="h-3.5 w-3.5" style={{ color: brandColor }} />
          {formatCount(pseudoLikes(article.id))}
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <MessageCircle className="h-3.5 w-3.5" />
          {formatCount(pseudoComments(article.id))}
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <Share2 className="h-3.5 w-3.5" />
          {formatCount(pseudoShares(article.id))}
        </span>
      </div>
    </article>
  );
}
