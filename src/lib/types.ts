export type PostStatus = "draft" | "published";

export type CategoryRef = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
};

export type PostSummary = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  author_name: string;
  reading_time: number;
  view_count: number;
  like_count: number;
  published_at: string | null;
  is_featured: boolean;
  category: CategoryRef | null;
};

export type PostDetail = PostSummary & {
  content: string;
  seo_description: string | null;
  tags: { name: string; slug: string }[];
};

export type CategoryWithCount = CategoryRef & {
  description: string | null;
  post_count: number;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string;
  image_url: string | null;
  registration_url: string | null;
};

export type SortKey = "newest" | "oldest" | "most_viewed" | "most_liked";
