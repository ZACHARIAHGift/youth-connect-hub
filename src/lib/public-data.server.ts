import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type {
  CategoryWithCount,
  EventItem,
  PostDetail,
  PostSummary,
  SortKey,
} from "./types";

const POST_COLUMNS =
  "id, title, subtitle, slug, excerpt, featured_image, author_name, reading_time, view_count, like_count, published_at, is_featured, category:categories(id, name, slug, color, icon)";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input as RequestInfo, { ...init, headers });
      },
    },
  });
}

type RawPost = Omit<PostSummary, "category"> & {
  category: PostSummary["category"] | PostSummary["category"][] | null;
};

function normalize(row: RawPost): PostSummary {
  const category = Array.isArray(row.category) ? (row.category[0] ?? null) : row.category;
  return { ...row, category: category ?? null };
}

export async function fetchPosts(params: {
  search?: string | undefined;
  category?: string | undefined;
  tag?: string | undefined;
  sort?: SortKey | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}): Promise<{ posts: PostSummary[]; total: number }> {
  const supabase = publicClient();
  const limit = params.limit ?? 9;
  const offset = params.offset ?? 0;

  let query = supabase
    .from("posts")
    .select(POST_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (params.search) {
    const term = `%${params.search.replace(/[%,]/g, "")}%`;
    query = query.or(
      `title.ilike.${term},subtitle.ilike.${term},excerpt.ilike.${term},content.ilike.${term},author_name.ilike.${term}`,
    );
  }
  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
  }
  if (params.tag) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", params.tag)
      .maybeSingle();
    const { data: links } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tag?.id ?? "00000000-0000-0000-0000-000000000000");
    query = query.in("id", (links ?? []).map((l) => l.post_id));
  }

  switch (params.sort) {
    case "oldest":
      query = query.order("published_at", { ascending: true });
      break;
    case "most_viewed":
      query = query.order("view_count", { ascending: false });
      break;
    case "most_liked":
      query = query.order("like_count", { ascending: false });
      break;
    default:
      query = query.order("published_at", { ascending: false });
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { posts: (data as unknown as RawPost[]).map(normalize), total: count ?? 0 };
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`${POST_COLUMNS}, content, seo_description, post_tags(tags(name, slug))`)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as RawPost & {
    content: string;
    seo_description: string | null;
    post_tags: { tags: { name: string; slug: string } | null }[] | null;
  };
  return {
    ...normalize(row),
    content: row.content,
    seo_description: row.seo_description,
    tags: (row.post_tags ?? []).flatMap((pt) => (pt.tags ? [pt.tags] : [])),
  };
}

export async function fetchAdjacentPosts(publishedAt: string | null) {
  const supabase = publicClient();
  const stamp = publishedAt ?? new Date().toISOString();
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from("posts")
      .select("title, slug")
      .eq("status", "published")
      .lt("published_at", stamp)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("title, slug")
      .eq("status", "published")
      .gt("published_at", stamp)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { previous: prev ?? null, next: next ?? null };
}

export async function fetchRelatedPosts(postId: string, categoryId: string | null) {
  const supabase = publicClient();
  let query = supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("status", "published")
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(3);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  const rows = (data as unknown as RawPost[] | null) ?? [];
  if (rows.length > 0) return rows.map(normalize);

  const { data: fallback } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("status", "published")
    .neq("id", postId)
    .order("view_count", { ascending: false })
    .limit(3);
  return ((fallback as unknown as RawPost[] | null) ?? []).map(normalize);
}

export async function fetchCategories(): Promise<CategoryWithCount[]> {
  const supabase = publicClient();
  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, color, icon, description").order("name"),
    supabase.from("posts").select("category_id").eq("status", "published"),
  ]);
  const counts = new Map<string, number>();
  for (const row of posts ?? []) {
    if (row.category_id) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return (categories ?? []).map((c) => ({ ...c, post_count: counts.get(c.id) ?? 0 }));
}

export async function fetchEvents(limit = 20): Promise<EventItem[]> {
  const supabase = publicClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, description, event_date, venue, image_url, registration_url")
    .eq("is_published", true)
    .gte("event_date", new Date(Date.now() - 86400000).toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  return (data ?? []) as EventItem[];
}

export async function fetchHomeData() {
  const [featured, recent, popular, categories, events] = await Promise.all([
    fetchPosts({ limit: 5, sort: "newest" }),
    fetchPosts({ limit: 6, sort: "newest", offset: 0 }),
    fetchPosts({ limit: 4, sort: "most_viewed" }),
    fetchCategories(),
    fetchEvents(4),
  ]);
  const featuredPosts = featured.posts.filter((p) => p.is_featured);
  const hero = featuredPosts[0] ?? featured.posts[0] ?? null;
  return {
    hero,
    featured: (featuredPosts.length > 1 ? featuredPosts.slice(1) : featured.posts.slice(1)).slice(
      0,
      3,
    ),
    recent: recent.posts.filter((p) => p.id !== hero?.id).slice(0, 4),
    popular: popular.posts.slice(0, 4),
    categories,
    events,
    totals: { articles: featured.total },
  };
}
