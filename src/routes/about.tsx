import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Megaphone, Sparkles, Users } from "lucide-react";

import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionHeading } from "@/components/site/SectionHeading";

const TITLE = "About the Youth Club Newsletter";
const DESCRIPTION =
  "Who we are, what the club stands for, and how our member-written community newsletter works.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Users,
    title: "Belonging",
    body: "Every young person in the neighbourhood has a place here, whatever their background.",
  },
  {
    icon: Sparkles,
    title: "Opportunity",
    body: "Skills workshops, leadership training and mentoring that open real doors.",
  },
  {
    icon: HeartHandshake,
    title: "Service",
    body: "We give back through clean-ups, food drives and volunteering across the borough.",
  },
  {
    icon: Megaphone,
    title: "Voice",
    body: "The newsletter is written by members, so the stories are told in their own words.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="kicker text-primary">About us</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            A club built by young people, for young people
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            The Youth Club has been a home for creativity, sport and friendship for over two
            decades. This newsletter is our shared record of it: the wins, the events, the people
            who show up week after week.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading kicker="What we stand for" title="Our values" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="article-body">
          <h2>How the newsletter works</h2>
          <p>
            Members pitch stories at the Monday editorial huddle. Anything goes: a match report, a
            profile of a volunteer, a photo essay from a trip. Our editorial team helps shape the
            draft, adds photos and publishes it here.
          </p>
          <p>
            Every fortnight the best pieces are collected into an email edition. Subscribing is
            free, and you can unsubscribe with one click.
          </p>
          <h2>Want to write for us?</h2>
          <p>
            Send us a note through the contact page with a sentence or two about your idea. No
            experience needed — we will pair you with an editor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <NewsletterSignup />
      </div>
    </PublicLayout>
  );
}
