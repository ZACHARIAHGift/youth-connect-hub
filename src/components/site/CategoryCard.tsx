import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";

import type { CategoryWithCount } from "@/lib/types";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      category.icon
    ] ?? Icons.Newspaper;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="hover-lift group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <span
        className="inline-flex size-11 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${category.color}1a`, color: category.color }}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-bold group-hover:text-primary">{category.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
      <p className="kicker mt-3 text-muted-foreground">
        {category.post_count} {category.post_count === 1 ? "article" : "articles"}
      </p>
    </Link>
  );
}
