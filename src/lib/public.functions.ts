import { createServerFn } from "@tanstack/react-start";

import {
  fetchAdjacentPosts,
  fetchCategories,
  fetchEvents,
  fetchHomeData,
  fetchPostBySlug,
  fetchPosts,
  fetchRelatedPosts,
} from "./public-data.server";
import type { SortKey } from "./types";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => fetchHomeData());

export const getCategories = createServerFn({ method: "GET" }).handler(async () =>
  fetchCategories(),
);

export const getEvents = createServerFn({ method: "GET" }).handler(async () => fetchEvents());

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      search?: string;
      category?: string;
      tag?: string;
      sort?: SortKey;
      page?: number;
      pageSize?: number;
    }) => input ?? {},
  )
  .handler(async ({ data }) => {
    const pageSize = Math.min(Math.max(data.pageSize ?? 9, 1), 24);
    const page = Math.max(data.page ?? 1, 1);
    const result = await fetchPosts({
      search: data.search?.slice(0, 120),
      category: data.category,
      tag: data.tag,
      sort: data.sort ?? "newest",
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return { ...result, page, pageSize };
  });

export const getPostPage = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const post = await fetchPostBySlug(data.slug);
    if (!post) return { post: null, related: [], previous: null, next: null };
    const [related, adjacent] = await Promise.all([
      fetchRelatedPosts(post.id, post.category?.id ?? null),
      fetchAdjacentPosts(post.published_at),
    ]);
    return { post, related, previous: adjacent.previous, next: adjacent.next };
  });
