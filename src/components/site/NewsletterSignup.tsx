import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
});

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");

  const subscribe = useMutation({
    mutationFn: async (value: string) => {
      const parsed = schema.parse({ email: value });
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: parsed.email.toLowerCase() });
      if (error && error.code !== "23505") throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("You're subscribed", {
        description: "The next edition lands in your inbox.",
      });
      setEmail("");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid email")
          : "Subscription failed. Please try again.";
      toast.error(message);
    },
  });

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        subscribe.mutate(email);
      }}
      className="flex w-full max-w-md gap-2"
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        maxLength={255}
        required
        aria-label="Email address"
      />
      <Button type="submit" disabled={subscribe.isPending}>
        {subscribe.isPending ? "Joining…" : "Subscribe"}
      </Button>
    </form>
  );

  if (compact) return form;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-ink px-6 py-12 text-ink-foreground sm:px-12">
      <div
        className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/30 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Mail className="size-5" />
        </span>
        <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">Never miss an edition</h2>
        <p className="mt-3 text-sm opacity-80">
          Club news, events and volunteer calls, delivered every fortnight. No spam, unsubscribe
          any time.
        </p>
        <div className="mt-6 flex justify-center">{form}</div>
      </div>
    </section>
  );
}
