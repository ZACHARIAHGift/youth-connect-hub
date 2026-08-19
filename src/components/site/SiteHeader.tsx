import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useSession } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/articles", label: "Newsletter" },
  { to: "/categories", label: "Categories" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/articles", search: { search: term.trim() || undefined, page: 1 } });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled ? "glass border-border shadow-card" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-base font-extrabold text-primary-foreground">
            YC
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold uppercase tracking-tight">
              Youth Club
            </span>
            <span className="kicker block text-muted-foreground">Community Newsletter</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search articles"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-4" />
          </Button>
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/admin">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/auth">Staff sign in</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-card px-4 py-3 sm:px-6">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl gap-2">
            <Input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={120}
              placeholder="Search articles, tags, authors…"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={user ? "/admin" : "/auth"}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                {user ? "Admin dashboard" : "Staff sign in"}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
