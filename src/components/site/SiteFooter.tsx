import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

import { NewsletterSignup } from "@/components/site/NewsletterSignup";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-base font-extrabold text-primary-foreground">
              YC
            </span>
            <span className="text-sm font-extrabold uppercase">Youth Club</span>
          </div>
          <p className="mt-4 text-sm opacity-75">
            A community of over 900 young people building skills, leading projects and looking
            after the neighbourhood we share.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Youth Club social profile"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 transition-colors hover:bg-primary hover:border-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="kicker text-primary">Quick links</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            {[
              { to: "/articles", label: "All articles" },
              { to: "/categories", label: "Categories" },
              { to: "/events", label: "Upcoming events" },
              { to: "/about", label: "About the club" },
              { to: "/contact", label: "Contact us" },
              { to: "/auth", label: "Staff sign in" },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="kicker text-primary">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" /> 14 Riverside Road, Community
              District
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> +234 800 000 0000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> hello@youthclub.org
            </li>
          </ul>
        </div>

        <div>
          <h3 className="kicker text-primary">Newsletter</h3>
          <p className="mt-4 text-sm opacity-75">Get each edition straight to your inbox.</p>
          <div className="mt-4">
            <NewsletterSignup compact />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs opacity-70 sm:px-6">
        © {new Date().getFullYear()} Youth Club Community Newsletter. All rights reserved.
      </div>
    </footer>
  );
}
