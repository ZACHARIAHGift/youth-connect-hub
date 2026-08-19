import { queryOptions } from "@tanstack/react-query";

import { getCategories, getEvents, getHomeData, getPostPage, listPosts } from "./public.functions";
import type { SortKey } from "./types";

export const homeQuery = () =>
  queryOptions({
    queryKey: ["home"],
    queryFn: () => getHomeData(),
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

export const eventsQuery = () =>
  queryOptions({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

export type PostListParams = {
  search?: string | undefined;
  category?: string | undefined;
  tag?: string | undefined;
  sort?: SortKey | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
};

export const postsQuery = (params: PostListParams) =>
  queryOptions({
    queryKey: ["posts", params],
    queryFn: () => listPosts({ data: params }),
  });

export const postPageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => getPostPage({ data: { slug } }),
  });
