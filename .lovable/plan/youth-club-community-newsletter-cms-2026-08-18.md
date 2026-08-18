# Youth Club Community Newsletter CMS

A production-quality newsletter/content platform: a public news site for members and a secure admin dashboard for the club team. Red / white / black identity (#C1121F, #FFFFFF, #111111) with a dark mode, smooth motion, and full responsiveness.

## Phase 1 — Foundation & design system

- Red/white/black semantic token set in `src/styles.css` (light + dark), success/warning/error tokens, soft shadows, glass surfaces, radii.
- Distinctive editorial typography pair (display headline + readable body), loaded via a `<link>` in the root route.
- Shared chrome: sticky navbar with search entry + dark-mode toggle, mobile drawer nav, footer (about, quick links, contact, socials), scroll-to-top button, toast notifications.
- Reusable pieces: ArticleCard, EventCard, CategoryCard, SectionHeading, loading skeletons, empty states.

## Phase 2 — Backend (Lovable Cloud)

Tables: `profiles`, `user_roles` (separate roles table, admin/editor), `categories`, `tags`, `posts`, `post_tags`, `post_likes`, `post_views`, `events`, `newsletter_subscribers`.

- Posts carry title, subtitle, slug, excerpt, rich content, featured image, category, author, status (draft/published), published_at, scheduled_at, reading_time, seo_description, view/like counts.
- Public read access limited to published posts, published events, and categories/tags; authors/admins can always read and manage their own drafts.
- Admin-only writes enforced server-side through a role check, never client state.
- Likes are per-visitor (anonymous fingerprint) so a reader can like once; views recorded on article open with counters kept in sync.
- Storage bucket for featured and in-article images.
- Seed migration inserts ~12 realistic Youth Club articles (Community Clean-up, Leadership Conference, Digital Skills Bootcamp, Mental Health Week, Volunteer Spotlight, Sports Festival, etc.), all 10 categories, tags, and several upcoming events with images.

## Phase 3 — Public site

- `/` homepage: hero with featured newsletter + CTA, featured grid, recent news, upcoming events, popular articles, categories, newsletter signup.
- `/articles` browse with instant search (title, excerpt, content, tags, category, author), category/tag filters, sort by newest / oldest / most viewed / most liked, pagination.
- `/articles/$slug`: large hero image, full typography-rich body, author + date + reading time, category/tags, view & like counts, like button, share buttons, related articles, previous/next navigation.
- `/categories/$slug`, `/events`, `/about`, `/contact` — each its own route with its own SEO metadata.
- Newsletter subscribe with validated email.

## Phase 4 — Auth & admin dashboard

- `/auth`: login with email/password, remember me, forgot password, validated inputs. Admin area lives behind a protected layout.
- Dashboard overview: stat cards (total/published/draft articles, categories, views, likes, most viewed, most liked), charts for monthly posts / views / likes and category distribution, recent activity, quick actions.
- `/admin/articles`: table with search, status filter, bulk actions, preview, publish/unpublish, delete confirmation.
- Article editor: rich text editing (headings, bold/italic/underline, quotes, lists, links, images, code blocks, tables, alignment, undo/redo), live preview, featured image upload, category, tags, slug auto-generation, SEO description, save draft / publish / schedule.
- `/admin/categories`, `/admin/events`, `/admin/subscribers` management screens.

## Phase 5 — Polish

Page transitions and hover micro-interactions, lazy-loaded images, skeletons on every async surface, keyboard/ARIA accessibility pass, per-route SEO metadata and JSON-LD for articles, mobile QA at 390px through desktop.

## Technical notes

The project runs on TanStack Start (React 19 + TypeScript + Tailwind v4 + TanStack Router/Query), so routing uses TanStack Router file routes rather than React Router — everything else in your stack list (Supabase via Lovable Cloud, React Hook Form, Zod, Lucide, Motion) is used as specified. Backend logic runs in typed server functions; reads use loader-primed TanStack Query. Deployment is handled by Lovable's own hosting (publish), which replaces the Vercel/Netlify step.

Phases ship in order so the site is reviewable after each one.
