"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { FooterLogo } from "./Logo";

/* Rebuilt to match the marketing footer in the Figma design (Frame 24 / 2:4748).
   The design uses white text at fixed opacities over the olive ground — not the
   champagne the old footer used. Type sizes/opacities below are lifted straight
   from the frame. `#F7E7CE` stands in for the design's champagne accent
   (`#E1D2BB`, an untokened one-off — see project-marketing-figma-redesign). */

const GROUND = "#556B2F"; // --accent
const CHAMPAGNE = "#F7E7CE"; // --text-chrome
const DIVIDER = "rgba(255,255,255,0.08)";

// White-with-opacity text colors from the frame.
const C = {
  heading: "rgba(255,255,255,0.4)", // column labels — 12px Bold, uppercase
  link: "rgba(255,255,255,0.55)", // nav / use-case / legal links — 14px
  muted: "rgba(255,255,255,0.5)", // taglines, copyright, placeholder
  strong: "#fff", // newsletter heading
};

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.254 2.25H8.08l4.263 5.634 5.9-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Icon order mirrors the design: LinkedIn, X, Instagram.
const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/share-momento", Icon: LinkedInIcon },
  { label: "X", href: "https://x.com/sharemomentoapp", Icon: XIcon },
  { label: "Instagram", href: "https://www.instagram.com/sharemomentoapp", Icon: InstagramIcon },
];

// `hash` links scroll to a section on the current page when it exists, else
// route to that section on the home page. `href` links are plain routes.
type FooterLink = { label: string; hash: string } | { label: string; href: string };

const USE_CASES: FooterLink[] = [
  { label: "Wedding Photo Sharing App", href: "/use-cases/wedding-photo-sharing-app" },
  { label: "QR Code Wedding Photo Sharing", href: "/use-cases/qr-code-wedding-photo-sharing" },
  { label: "Collect Wedding Guest Photos", href: "/use-cases/collect-wedding-guest-photos" },
  { label: "Birthday Party Photo Sharing", href: "/use-cases/birthday-party-photo-sharing" },
  { label: "Event Photo Sharing App", href: "/use-cases/event-photo-sharing-app" },
  { label: "Wedding Guest Photo Upload", href: "/use-cases/wedding-guest-photo-upload" },
  { label: "Shared Wedding Album", href: "/use-cases/shared-wedding-album" },
  { label: "Event QR Code Photo Upload", href: "/use-cases/event-qr-code-photo-upload" },
];

const PRODUCT: FooterLink[] = [
  { label: "How It Works", hash: "#how-it-works" },
  { label: "Features", hash: "#features" },
  { label: "Pricing", href: "/pricing" },
];

const RESOURCES: FooterLink[] = [
  { label: "FAQs", hash: "#faqs" },
  { label: "Blog", href: "/blog" },
  { label: "Wedding Guide", href: "/wedding-guide" },
  { label: "Affiliate Programs", href: "/affiliates" },
  { label: "Contact", href: "/contact" },
  { label: "Partners", href: "/partners" },
];

const LEGAL: FooterLink[] = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Security Policy", href: "/security" },
];

const linkStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  lineHeight: "21px",
  color: C.link,
  textDecoration: "none",
  transition: "color 0.15s, filter 0.15s",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};
const onHoverIn = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = CHAMPAGNE);
const onHoverOut = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = C.link);

function FooterLinkNode({ link, onSection }: { link: FooterLink; onSection: (hash: string) => void }) {
  if ("hash" in link) {
    return (
      <button type="button" onClick={() => onSection(link.hash)} style={linkStyle} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>
        {link.label}
      </button>
    );
  }
  return (
    <Link href={link.href} style={linkStyle} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>
      {link.label}
    </Link>
  );
}

function LinkColumn({ heading, links, onSection }: { heading: string; links: FooterLink[]; onSection: (hash: string) => void }) {
  return (
    <div className="flex flex-col gap-[15px]">
      <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.heading, margin: 0 }}>
        {heading}
      </p>
      {links.map((link) => (
        <FooterLinkNode key={link.label} link={link} onSection={onSection} />
      ))}
    </div>
  );
}

export function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function goToSection(hash: string) {
    const el = typeof document !== "undefined" ? document.querySelector(hash) : null;
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else router.push("/" + hash);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // No newsletter backend exists yet — this only confirms client-side.
    setSubscribed(true);
  }

  return (
    <footer
      className="pt-14 pb-12"
      style={{ background: GROUND, fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)" }}
    >
      <div className="site-container">
        {/* Top: brand + link columns */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:shrink-0" style={{ maxWidth: "340px" }}>
            <Link href="/" style={{ display: "inline-block", width: "fit-content" }}>
              <FooterLogo />
            </Link>
            <p style={{ fontSize: "0.875rem", lineHeight: "23px", color: C.muted, margin: 0 }}>
              Collect every guest photo from your event.
            </p>
            <p style={{ fontSize: "0.75rem", lineHeight: "19px", color: C.muted, margin: 0 }}>
              Your memories, securely shared.
            </p>
            <div className="flex items-center gap-3 mt-1">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", color: C.link, textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = C.link;
                  }}
                >
                  <s.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns + Get Started */}
          <div className="flex flex-wrap gap-x-12 gap-y-10 lg:gap-x-16">
            <LinkColumn heading="Product" links={PRODUCT} onSection={goToSection} />
            <LinkColumn heading="Use Cases" links={USE_CASES} onSection={goToSection} />
            <LinkColumn heading="Resources" links={RESOURCES} onSection={goToSection} />
            <Link
              href="/auth/register"
              style={{ fontSize: "1rem", fontWeight: 700, color: CHAMPAGNE, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: DIVIDER, margin: "50px 0 30px" }} />

        {/* Newsletter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-[10px]">
            <p style={{ fontSize: "1.25rem", fontWeight: 500, lineHeight: "36px", color: C.strong, margin: 0 }}>
              Collect every guest photo from your event.
            </p>
            <p style={{ fontSize: "0.75rem", lineHeight: "22px", color: C.muted, margin: 0 }}>
              Join 12,000+ couples and planners. No spam, ever.
            </p>
          </div>

          {subscribed ? (
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: CHAMPAGNE, margin: 0 }}>
              Thanks — you&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1.36px solid rgba(255,255,255,0.2)",
                borderRadius: 50,
                paddingLeft: 20,
                paddingRight: 2,
                paddingTop: 2,
                paddingBottom: 2,
                maxWidth: "100%",
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Your email address"
                className="bg-transparent outline-none border-none"
                style={{ fontSize: "0.9375rem", color: "#fff", width: 180, maxWidth: "44vw", padding: "12px 0" }}
              />
              <button
                type="submit"
                className="flex items-center gap-2 transition-transform hover:scale-[1.03]"
                style={{ background: "#1C2410", color: "#fff", borderRadius: 50, padding: "12px 22px", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Subscribe
                <ArrowRight size={16} weight="bold" />
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: DIVIDER, margin: "30px 0" }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p style={{ fontSize: "0.75rem", lineHeight: "22px", color: C.muted, margin: 0 }}>
            © 2026 Momento App. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL.map((link) => (
              <FooterLinkNode key={link.label} link={link} onSection={goToSection} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
