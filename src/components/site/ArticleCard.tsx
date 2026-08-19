import { Link } from "@tanstack/react-router";
import { Clock, Eye, Heart } from "lucide-react";

import { compactNumber, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/lib/types";

type Props = {
  post: PostSummary;
  variant?: "default" | "compact" | "wide";
  className?: string;
};

export function ArticleCard({ post, variant = "default", className }: Props) {
  const image = post.featured_image ?? undefined;

  if (variant === "compact") {
    return (
      <Link
        to="/articles/$slug"
        params={{ slug: post.slug }}
        className={cn(
          "group flex gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40",
          className,
        )}
      >
        {image ? (
          <img
            src={image}
            alt={post.title}
            loading="lazy"
            className="size-20 shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="kicker text-primary">{post.category?.name ?? "Newsletter"}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDate(post.published_at)}</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" /> {compactNumber(post.view_count)}
            </span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: post.slug }}
      className={cn(
        "hover-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card",
        variant === "wide" && "sm:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          variant === "wide" ? "sm:w-2/5" : "aspect-16/10",
        )}
      >
        {image ? (
          <img
            src={image}
            alt={post.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {post.category ? (
          <span className="kicker absolute left-3 top-3 rounded-sm bg-primary px-2 py-1 text-primary-foreground">
            {post.category.name}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{post.author_name}</span>
          <span>{formatDate(post.published_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {post.reading_time} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" /> {compactNumber(post.view_count)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3" /> {compactNumber(post.like_count)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-16/10 animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
