"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FooterLogo } from "./Logo";

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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/share-momento", Icon: LinkedInIcon },
  { label: "X",        href: "https://x.com/sharemomentoapp",                  Icon: XIcon },
  { label: "Instagram",href: "https://www.instagram.com/sharemomentoapp",       Icon: InstagramIcon },
];

const NAV_LINKS = [
  { label: "Features",    hash: "#features" },
  { label: "How It Works",hash: "#how-it-works" },
  { label: "FAQs",        hash: "#faqs" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use",   href: "/terms" },
  { label: "Security Policy",href: "/security" },
];

export function Footer() {
  const pathname = usePathname();
  const router   = useRouter();

  function handleSectionLink(hash: string) {
    if (pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/" + hash);
    }
  }

  return (
    <footer className="px-6 pt-14 pb-8" style={{ background: "#556B2F" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

        {/* Left */}
        <div className="flex flex-col gap-4">
          <Link href="/" style={{ display: "inline-block" }}>
            <FooterLogo />
          </Link>
          <p style={{ fontSize: "0.88rem", color: "rgba(247,231,206,0.7)", maxWidth: "240px", lineHeight: 1.65 }}>
            Private event photo sharing made simple.
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(247,231,206,0.45)" }}>
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
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(247,231,206,0.12)", color: "rgba(247,231,206,0.7)", textDecoration: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(247,231,206,0.22)";
                  (e.currentTarget as HTMLElement).style.color = "#F7E7CE";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(247,231,206,0.12)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(247,231,206,0.7)";
                }}
              >
                <s.Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Right: nav links */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleSectionLink(link.hash)}
              className="bg-transparent border-none cursor-pointer text-left p-0 transition-colors"
              style={{ fontWeight: 500, fontSize: "0.9rem", color: "rgba(247,231,206,0.8)" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#F7E7CE")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(247,231,206,0.8)")}
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/auth/register"
            style={{ fontWeight: 700, fontSize: "0.9rem", color: "#F7E7CE", textDecoration: "none" }}
          >
            Get Started
          </Link>
        </div>
      </div>

      <div
        className="max-w-5xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(247,231,206,0.12)" }}
      >
        <p style={{ fontSize: "0.78rem", color: "rgba(247,231,206,0.35)" }}>
          © 2026 Momento App. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {LEGAL_LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-4">
              <Link
                href={link.href}
                style={{ fontSize: "0.75rem", color: "rgba(247,231,206,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(247,231,206,0.6)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(247,231,206,0.3)")}
              >
                {link.label}
              </Link>
              {i < LEGAL_LINKS.length - 1 && (
                <span style={{ color: "rgba(247,231,206,0.15)", fontSize: "0.75rem" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}