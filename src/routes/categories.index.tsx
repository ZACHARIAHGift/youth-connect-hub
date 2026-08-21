import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CategoryCard } from "@/components/site/CategoryCard";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery } from "@/lib/queries";

const TITLE = "Newsletter Categories — Youth Club";
const DESCRIPTION =
  "Explore Youth Club newsletter categories: community, sports, education, volunteering, wellbeing and more.";

export const Route = createFileRoute("/categories/")({
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
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useQuery(categoriesQuery());

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading
          kicker="Browse"
          title="Categories"
          description="Every story we publish is filed under one of these club themes."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
            : (data ?? []).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
        </div>
      </section>
    </PublicLayout>
  );
}
