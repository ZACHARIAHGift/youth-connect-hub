export function formatDate(value: string | null | undefined) {
  if (!value) return "Unscheduled";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatLongDate(value: string | null | undefined) {
  if (!value) return "Unscheduled";
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function compactNumber(value: number) {
  // Formatted manually: Intl compact notation differs between the server and
  // browser ICU builds ("1.3K" vs "1.3k"), which breaks hydration.
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}K`;
  }
  const m = value / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}M`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function estimateReadingTime(html: string) {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function stripHtml(html: string, max = 200) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
