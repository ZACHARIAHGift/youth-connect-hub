import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { ArticleCard, ArticleCardSkeleton } from "@/components/site/ArticleCard";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesQuery, postsQuery } from "@/lib/queries";
import type { SortKey } from "@/lib/types";

type ArticleSearch = {
  search?: string | undefined;
  category?: string | undefined;
  sort?: SortKey | undefined;
  page?: number | undefined;
};

const TITLE = "All Articles — Youth Club Newsletter";
const DESCRIPTION =
  "Search and filter every published Youth Club newsletter article by category, popularity or date.";

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): ArticleSearch => ({
    search: typeof search.search === "string" && search.search ? search.search : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    sort: (["newest", "oldest", "most_viewed", "most_liked"] as const).includes(
      search.sort as SortKey,
    )
      ? (search.sort as SortKey)
      : undefined,
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: ArticlesPage,
});

const PAGE_SIZE = 9;

function ArticlesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState(search.search ?? "");

  useEffect(() => setTerm(search.search ?? ""), [search.search]);

  // debounce the instant search
  useEffect(() => {
    const current = search.search ?? "";
    if (term === current) return;
    const id = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, search: term || undefined, page: undefined }) });
    }, 350);
    return () => clearTimeout(id);
  }, [term, search.search, navigate]);

  const categories = useQuery(categoriesQuery());
  const page = search.page ?? 1;
  const posts = useQuery(
    postsQuery({
      search: search.search,
      category: search.category,
      sort: search.sort ?? "newest",
      page,
      pageSize: PAGE_SIZE,
    }),
  );

  const total = posts.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PublicLayout>
      <header className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="kicker text-primary">The newsletter archive</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">All articles</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every published edition, searchable by title, tag, author, category and content.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={120}
              placeholder="Search articles…"
              className="pl-9"
              aria-label="Search articles"
            />
          </div>
          <Select
            value={search.category ?? "all"}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  category: value === "all" ? undefined : value,
                  page: undefined,
                }),
              })
            }
          >
            <SelectTrigger className="sm:w-52" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={search.sort ?? "newest"}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({ ...prev, sort: value as SortKey, page: undefined }),
              })
            }
          >
            <SelectTrigger className="sm:w-44" aria-label="Sort articles">
              <SlidersHorizontal className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="most_viewed">Most viewed</SelectItem>
              <SelectItem value="most_liked">Most liked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          {posts.isLoading ? "Searching…" : `${total} ${total === 1 ? "article" : "articles"} found`}
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            : (posts.data?.posts ?? []).map((post) => <ArticleCard key={post.id} post={post} />)}
        </div>

        {!posts.isLoading && total === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <h2 className="text-lg font-bold">No articles match that search</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different term or clear the filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate({ search: {} })}
            >
              Clear filters
            </Button>
          </div>
        ) : null}

        {pages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: page - 1 <= 1 ? undefined : page - 1 }) })
              }
            >
              Previous
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              disabled={page >= pages}
              onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
