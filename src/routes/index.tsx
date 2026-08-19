import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, Eye, Flame, Heart } from "lucide-react";

import { ArticleCard } from "@/components/site/ArticleCard";
import { CategoryCard } from "@/components/site/CategoryCard";
import { EventCard } from "@/components/site/EventCard";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { compactNumber, formatDate } from "@/lib/format";
import { homeQuery } from "@/lib/queries";

const TITLE = "Youth Club Community Newsletter — News, Events & Stories";
const DESCRIPTION =
  "The official Youth Club newsletter: club announcements, community projects, workshops, volunteer calls, events and member success stories.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeQuery());
  },
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery());
  const { hero, featured, recent, popular, categories, events } = data;

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-ink-foreground">
        {hero?.featured_image ? (
          <img
            src={hero.featured_image}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-30"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="fade-up">
            <span className="kicker inline-block rounded-sm bg-primary px-2.5 py-1 text-primary-foreground">
              Latest edition
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              {hero?.title ?? "Youth Club Community Newsletter"}
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-85 sm:text-lg">
              {hero?.excerpt ??
                "Announcements, community projects, workshops and stories from our members."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {hero ? (
                <Button asChild size="lg">
                  <Link to="/articles/$slug" params={{ slug: hero.slug }}>
                    Read the story <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10"
              >
                <Link to="/articles">Browse the newsletter</Link>
              </Button>
            </div>
            {hero ? (
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs opacity-80">
                <span className="font-semibold">{hero.author_name}</span>
                <span>{formatDate(hero.published_at)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" /> {hero.reading_time} min read
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3" /> {compactNumber(hero.view_count)} views
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3" /> {compactNumber(hero.like_count)} likes
                </span>
              </div>
            ) : null}
          </div>

          <aside className="fade-up rounded-2xl border border-white/12 bg-white/5 p-5 backdrop-blur-sm">
            <h2 className="kicker text-primary">Also in this edition</h2>
            <ul className="mt-4 divide-y divide-white/10">
              {recent.slice(0, 4).map((post) => (
                <li key={post.id}>
                  <Link
                    to="/articles/$slug"
                    params={{ slug: post.slug }}
                    className="group block py-3"
                  >
                    <p className="kicker text-primary/90">{post.category?.name}</p>
                    <p className="mt-1 text-sm font-semibold leading-snug group-hover:text-primary">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs opacity-70">{formatDate(post.published_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          kicker="Featured stories"
          title="Handpicked by the editorial team"
          description="The projects, programmes and people shaping the club this term."
          actionLabel="All articles"
          actionTo="/articles"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* RECENT + POPULAR */}
      <section className="border-y border-border bg-muted/40 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <SectionHeading kicker="Recent news" title="Fresh from the club" />
            <div className="grid gap-6 sm:grid-cols-2">
              {recent.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-8">
              <p className="kicker inline-flex items-center gap-1.5 text-primary">
                <Flame className="size-3.5" /> Popular now
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">Most read</h2>
            </div>
            <div className="space-y-3">
              {popular.map((post) => (
                <ArticleCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          kicker="Upcoming events"
          title="What's on at the club"
          description="Sessions, festivals and workshops open to members and families."
          actionLabel="All events"
          actionTo="/events"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            kicker="Explore"
            title="Browse by category"
            description="Ten strands of club life, from leadership to sports."
            actionLabel="See all"
            actionTo="/categories"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.slice(0, 10).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <NewsletterSignup />
      </section>
    </PublicLayout>
  );
}
