import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EventCard } from "@/components/site/EventCard";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsQuery } from "@/lib/queries";

const TITLE = "Upcoming Youth Club Events";
const DESCRIPTION =
  "Workshops, sports festivals, volunteer days and community meet-ups coming up at the Youth Club.";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(eventsQuery());
  },
  component: EventsPage,
});

function EventsPage() {
  const { data, isLoading } = useQuery(eventsQuery());

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading
          kicker="What's on"
          title="Upcoming events"
          description="Everything happening at the club over the coming weeks. All members welcome."
        />
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <p className="font-semibold">No events scheduled right now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscribe below and we'll email you when the next one opens.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <NewsletterSignup />
      </div>
    </PublicLayout>
  );
}
