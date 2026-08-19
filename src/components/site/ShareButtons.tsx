import { Facebook, Link2, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/articles/${slug}`;

  const links = [
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map(({ label, icon: Icon, href }) => (
        <Button key={label} asChild variant="outline" size="icon" aria-label={label}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Icon className="size-4" />
          </a>
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        aria-label="Copy link"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        }}
      >
        <Link2 className="size-4" />
      </Button>
    </div>
  );
}
