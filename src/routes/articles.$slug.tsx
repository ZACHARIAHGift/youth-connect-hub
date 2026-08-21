import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, Eye, User } from "lucide-react";
import { useEffect } from "react";

import { ArticleCard } from "@/components/site/ArticleCard";
import { LikeButton } from "@/components/site/LikeButton";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ShareButtons } from "@/components/site/ShareButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitorId } from "@/hooks/use-visitor-id";
import { supabase } from "@/integrations/supabase/client";
import { compactNumber, formatLongDate } from "@/lib/format";
import { postPageQuery } from "@/lib/queries";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) =>
    context.queryClient.ensureQueryData(postPageQuery(params.slug)),
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Article unavailable — Youth Club Newsletter" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = post.seo_description ?? post.excerpt;
    return {
      meta: [
        { title: `${post.title} — Youth Club Newsletter` },
        { name: "description", content: description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(post.featured_image?.startsWith("https://")
          ? [
              { property: "og:image", content: post.featured_image },
              { name: "twitter:image", content: post.featured_image },
            ]
          : []),
      ],
    };
  },
  component: ArticleDetailPage,
  errorComponent: ArticleFallback,
  notFoundComponent: ArticleFallback,
});

function ArticleFallback() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="kicker text-primary">Newsletter</p>
        <h1 className="mt-2 text-3xl font-extrabold">We couldn't load this article</h1>
        <p className="mt-3 text-muted-foreground">
          It may have been unpublished or the link is incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link to="/articles">Browse all articles</Link>
        </Button>
      </div>
    </PublicLayout>
  );
}

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(postPageQuery(slug));
  const visitorId = useVisitorId();
  const post = data?.post ?? null;

  useEffect(() => {
    if (!post || !visitorId) return;
    const key = `yc-viewed-${post.id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void supabase.from("post_views").insert({ post_id: post.id, visitor_id: visitorId });
  }, [post, visitorId]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-16">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!post) return <ArticleFallback />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.seo_description ?? post.excerpt,
    datePublished: post.published_at,
    author: { "@type": "Person", name: post.author_name },
    publisher: { "@type": "Organization", name: "Youth Club" },
    ...(post.featured_image ? { image: post.featured_image } : {}),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> All articles
        </Link>

        <div className="mt-6">
          {post.category ? (
            <Link
              to="/categories/$slug"
              params={{ slug: post.category.slug }}
              className="kicker text-primary"
            >
              {post.category.name}
            </Link>
          ) : null}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">{post.title}</h1>
          {post.subtitle ? (
            <p className="mt-4 text-lg text-muted-foreground">{post.subtitle}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" /> {post.author_name}
            </span>
            <span>{formatLongDate(post.published_at)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {post.reading_time} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" /> {compactNumber(post.view_count)} views
            </span>
          </div>
        </div>

        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-xl object-cover shadow-card"
          />
        ) : null}

        <div
          className="article-body mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.slug} to="/articles" search={{ search: tag.name }}>
                <Badge variant="secondary">#{tag.name}</Badge>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
          <LikeButton postId={post.id} slug={post.slug} likeCount={post.like_count} />
          <ShareButtons title={post.title} slug={post.slug} />
        </div>

        <nav className="mt-8 grid gap-3 sm:grid-cols-2">
          {data?.previous ? (
            <Link
              to="/articles/$slug"
              params={{ slug: data.previous.slug }}
              className="group rounded-lg border border-border p-4 hover:border-primary/40"
            >
              <span className="kicker text-muted-foreground">
                <ArrowLeft className="mr-1 inline size-3" /> Previous
              </span>
              <p className="mt-1 font-bold group-hover:text-primary">{data.previous.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {data?.next ? (
            <Link
              to="/articles/$slug"
              params={{ slug: data.next.slug }}
              className="group rounded-lg border border-border p-4 text-right hover:border-primary/40"
            >
              <span className="kicker text-muted-foreground">
                Next <ArrowRight className="ml-1 inline size-3" />
              </span>
              <p className="mt-1 font-bold group-hover:text-primary">{data.next.title}</p>
            </Link>
          ) : null}
        </nav>
      </article>

      {data && data.related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <SectionHeading kicker="Keep reading" title="Related stories" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((related) => (
              <ArticleCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      ) : null}
    </PublicLayout>
  );
}
