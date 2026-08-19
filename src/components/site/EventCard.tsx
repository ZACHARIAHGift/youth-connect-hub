import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatLongDate, formatTime } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.event_date);
  return (
    <article className="hover-lift flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="relative aspect-16/9 overflow-hidden bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : null}
        <div className="absolute left-3 top-3 rounded-md bg-ink px-3 py-2 text-center text-ink-foreground">
          <span className="block text-xl font-extrabold leading-none">{date.getDate()}</span>
          <span className="kicker block">
            {date.toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">{event.title}</h3>
        {event.description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {event.description}
          </p>
        ) : null}
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            {formatLongDate(event.event_date)}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            {formatTime(event.event_date)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {event.venue}
          </li>
        </ul>
        <Button asChild className="mt-5 w-full">
          <a href={event.registration_url ?? "#"}>Register interest</a>
        </Button>
      </div>
    </article>
  );
}
