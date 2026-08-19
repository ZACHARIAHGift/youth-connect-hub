import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type Props = {
  kicker: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
};

export function SectionHeading({ kicker, title, description, actionLabel, actionTo }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="kicker text-primary">{kicker}</p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="group inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
