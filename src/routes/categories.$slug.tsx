import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ArticleCard, ArticleCardSkeleton } from "@/components/site/ArticleCard";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { categoriesQuery, postsQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} articles — Youth Club Newsletter`;
    const description = `Every Youth Club newsletter story filed under ${name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const categories = useQuery(categoriesQuery());
  const category = (categories.data ?? []).find((c) => c.slug === slug);
  const posts = useQuery(postsQuery({ category: slug, pageSize: 24, sort: "newest" }));

  return (
    <PublicLayout>
      <section className="border-b border-border bg-muted/40 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/categories" className="kicker text-primary">
            Categories
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">
            {category?.name ?? slug.replace(/-/g, " ")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {category?.description ?? "Stories from the Youth Club community."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {posts.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : (posts.data?.posts.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <p className="font-semibold">No articles here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon, or browse the full newsletter.
            </p>
            <Button asChild className="mt-5">
              <Link to="/articles">All articles</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(posts.data?.posts ?? []).map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
