import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TITLE = "Contact the Youth Club";
const DESCRIPTION =
  "Get in touch with the Youth Club team about membership, volunteering, events or newsletter story ideas.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  subject: z.string().trim().min(3, "Add a short subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});

const DETAILS = [
  { icon: MapPin, label: "Youth Club Hall, 14 Riverside Road" },
  { icon: Mail, label: "hello@youthclub.org" },
  { icon: Phone, label: "+44 20 7946 0102" },
  { icon: Clock, label: "Mon–Fri, 3pm – 9pm" },
];

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setValues({ name: "", email: "", subject: "", message: "" });
      toast.success("Message ready to send", {
        description: "Email hello@youthclub.org and we'll reply within two working days.",
      });
    }, 500);
  }

  return (
    <PublicLayout>
      <section className="border-b border-border bg-muted/40 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="kicker text-primary">Contact</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Say hello</h1>
          <p className="mt-4 text-muted-foreground">
            Questions about joining, volunteering or a story idea for the newsletter? Drop us a
            line.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                maxLength={80}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                maxLength={255}
                required
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={values.subject}
              onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
              maxLength={120}
              required
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              maxLength={2000}
              required
            />
          </div>
          <Button type="submit" className="mt-5" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-bold">Club details</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {DETAILS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-ink p-6 text-ink-foreground">
            <h2 className="font-bold">Join the mailing list</h2>
            <p className="mt-1 text-sm opacity-80">Fortnightly club news, no spam.</p>
            <div className="mt-4">
              <NewsletterSignup compact />
            </div>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
