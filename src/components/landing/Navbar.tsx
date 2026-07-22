"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { List, X, CaretDown } from "@phosphor-icons/react";
import { GreenLogo, FooterLogo } from "./Logo";
import { createClient } from "@/lib/supabase/client";

type NavChild = { label: string; href: string };
type NavLink =
  | { label: string; hash: string }
  | { label: string; href: string }
  | { label: string; children: NavChild[] };

const isHashLink = (l: NavLink): l is { label: string; hash: string } => "hash" in l;
const isDropdown = (l: NavLink): l is { label: string; children: NavChild[] } => "children" in l;

const useCases: NavChild[] = [
  { label: "QR code wedding photo sharing", href: "/use-cases/qr-code-wedding-photo-sharing" },
  { label: "Event photo sharing app", href: "/use-cases/event-photo-sharing-app" },
  { label: "Collect wedding guest photos", href: "/use-cases/collect-wedding-guest-photos" },
  { label: "Birthday party photo sharing", href: "/use-cases/birthday-party-photo-sharing" },
  { label: "Event QR code", href: "/use-cases/event-qr-code" },
  { label: "Wedding guest photo upload", href: "/use-cases/wedding-guest-photo-upload" },
  { label: "Shared wedding album", href: "/use-cases/shared-wedding-album" },
];

const links: NavLink[] = [
  { label: "How It Works", hash: "#how-it-works" },
  { label: "Features", hash: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Use Cases", children: useCases },
  { label: "FAQs", hash: "#faqs" },
  { label: "Contact", href: "/contact" },
];

const facts = [
  { stat: "500+", label: "Events captured" },
  { stat: "Private", label: "By default — no public sharing" },
  { stat: "60 sec", label: "Average setup time" },
  { stat: "Any device", label: "No app download required" },
  { stat: "All formats", label: "Photos & videos supported" },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.254 2.25H8.08l4.263 5.634 5.9-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate facts
  useEffect(() => {
    if (!menuOpen) return;
    const t = setInterval(() => {
      setFactIndex((i) => (i + 1) % facts.length);
    }, 2800);
    return () => clearInterval(t);
  }, [menuOpen]);

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close the desktop dropdown on outside click or Escape
  useEffect(() => {
    if (!openDropdown) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDropdown]);

  function handleSectionLink(hash: string) {
    setMenuOpen(false);
    if (pathname === "/") {
      setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      router.push("/" + hash);
    }
  }

  // Any route other than the home page gets the solid chrome, since only
  // the home page has a hero for the transparent nav to sit over.
  const isSubPage = pathname !== "/";
  const year = new Date().getFullYear();

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || isSubPage ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled || isSubPage ? "blur(12px)" : "none",
          boxShadow: scrolled || isSubPage ? "0 1px 24px rgba(85,107,47,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ display: "block" }}>
            <GreenLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {links.map((link) => {
              if (isDropdown(link)) {
                const open = openDropdown === link.label;
                return (
                  <div key={link.label} className="relative" ref={open ? dropdownRef : undefined}>
                    <button
                      onClick={() => setOpenDropdown(open ? null : link.label)}
                      aria-expanded={open}
                      aria-haspopup="true"
                      className="bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70 flex items-center gap-1"
                      style={{ fontWeight: 500, fontSize: "0.875rem", color: "#556B2F" }}
                    >
                      {link.label}
                      <CaretDown
                        size={12}
                        weight="bold"
                        style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                      />
                    </button>
                    {open && (
                      <div
                        style={{
                          position: "absolute", top: "calc(100% + 0.75rem)", left: "50%", transform: "translateX(-50%)",
                          minWidth: "17rem", background: "#fff", borderRadius: "0.875rem",
                          boxShadow: "0 8px 32px rgba(85,107,47,0.14)", border: "1px solid rgba(85,107,47,0.1)",
                          padding: "0.5rem", display: "flex", flexDirection: "column", zIndex: 60,
                        }}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            style={{ padding: "0.625rem 0.75rem", fontSize: "0.875rem", fontWeight: 500, color: "#333", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (isHashLink(link)) {
                return (
                  <button
                    key={link.label}
                    onClick={() => handleSectionLink(link.hash)}
                    className="bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                    style={{ fontWeight: 500, fontSize: "0.875rem", color: "#556B2F" }}
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-opacity hover:opacity-70"
                  style={{ fontWeight: 500, fontSize: "0.875rem", color: "#556B2F", textDecoration: "none" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-full transition-all hover:opacity-90 hover:scale-105"
                style={{ fontWeight: 600, fontSize: "0.95rem", background: "#556B2F", color: "#F7E7CE", textDecoration: "none" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{ fontWeight: 500, fontSize: "0.875rem", color: "#556B2F", textDecoration: "none" }}
                  className="transition-opacity hover:opacity-70"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 rounded-full transition-all hover:opacity-90 hover:scale-105"
                  style={{ fontWeight: 600, fontSize: "0.95rem", background: "#556B2F", color: "#F7E7CE", textDecoration: "none" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden bg-transparent border-none cursor-pointer p-1"
            onClick={() => setMenuOpen(true)}
            style={{ color: "#556B2F" }}
            aria-label="Open menu"
          >
            <List size={26} />
          </button>
        </div>
      </nav>

      {/* Sidebar overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(10,20,47,0.45)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(85vw, 340px)",
          zIndex: 101,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0, 0.15, 1)",
          boxShadow: "-8px 0 40px rgba(85,107,47,0.12)",
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(85,107,47,0.1)" }}>
          <GreenLogo />
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#556B2F", padding: "0.25rem" }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {links.map((link) => {
            const itemStyle = { background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, padding: "0.875rem 0.75rem", fontSize: "1.0625rem", fontWeight: 600, color: "#333", borderRadius: "0.75rem", transition: "background 0.15s, filter 0.15s", textDecoration: "none", display: "block" };

            if (isDropdown(link)) {
              const open = openMobileGroup === link.label;
              return (
                <div key={link.label}>
                  <button
                    onClick={() => setOpenMobileGroup(open ? null : link.label)}
                    aria-expanded={open}
                    style={{ ...itemStyle, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    {link.label}
                    <CaretDown
                      size={14}
                      weight="bold"
                      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                    />
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", paddingLeft: "0.75rem" }}>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          style={{ ...itemStyle, fontSize: "0.9375rem", fontWeight: 500, color: "#666" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (isHashLink(link)) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleSectionLink(link.hash)}
                  style={itemStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  {link.label}
                </button>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={itemStyle}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {link.label}
              </Link>
            );
          })}

          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{ display: "block", textAlign: "center", padding: "0.875rem", borderRadius: "999px", background: "#556B2F", color: "#F7E7CE", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "block", textAlign: "center", padding: "0.875rem", borderRadius: "999px", background: "#556B2F", color: "#F7E7CE", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "block", textAlign: "center", padding: "0.875rem", borderRadius: "999px", border: "1.5px solid #556B2F", color: "#556B2F", fontWeight: 600, fontSize: "1rem", textDecoration: "none" }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Facts carousel */}
        <div style={{ margin: "0.75rem 1.5rem 0", borderRadius: "1rem", background: "linear-gradient(135deg, #f3f7ee 0%, #e8f0de 100%)", padding: "1.25rem 1.5rem 2.5rem", overflow: "hidden" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#556B2F", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.75rem", opacity: 0.65 }}>
            Did you know?
          </p>

          {/* Fixed height container — all cards absolutely stacked */}
          <div style={{ position: "relative", height: "52px" }}>
            {facts.map((fact, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: i === factIndex ? 1 : 0,
                  transform: i === factIndex ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 0.45s ease, transform 0.45s ease",
                  pointerEvents: i === factIndex ? "auto" : "none",
                }}
              >
                <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "#556B2F", lineHeight: 1, margin: "0 0 0.25rem" }}>
                  {fact.stat}
                </p>
                <p style={{ fontSize: "0.825rem", color: "#666", lineHeight: 1.4, margin: 0 }}>
                  {fact.label}
                </p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display: "flex", gap: "5px", marginTop: "0.875rem" }}>
            {facts.map((_, i) => (
              <button
                key={i}
                onClick={() => setFactIndex(i)}
                style={{ width: i === factIndex ? "16px" : "6px", height: "6px", borderRadius: "999px", background: i === factIndex ? "#556B2F" : "rgba(85,107,47,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }}
              />
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Social icons */}
        <div style={{ padding: "1rem 1.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {[
           
            { href: "https://instagram.com/sharemomentoapp", icon: <InstagramIcon />, label: "Instagram" },
            { href: "https://linkedin.com/company/share-momento", icon: <LinkedInIcon />, label: "LinkedIn" },
            { href: "https://x.com/sharemomentoapp", icon: <XIcon />, label: "X" },
          ].map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{ width: "36px", height: "36px", borderRadius: "0.625rem", background: "rgba(85,107,47,0.08)", color: "#556B2F", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.15s, filter 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(85,107,47,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(85,107,47,0.08)")}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Footer footnotes */}
        <div style={{ padding: "0.75rem 1.5rem 1.5rem", borderTop: "1px solid rgba(85,107,47,0.08)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Terms of Use", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Security", href: "/security" },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: "0.75rem", color: "#888", textDecoration: "none", transition: "color 0.15s, filter 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#556B2F")}
                onMouseLeave={e => (e.currentTarget.style.color = "#888")}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: "0.7rem", color: "#aaa" }}>
            © {year} Momento App
          </p>
        </div>
      </aside>
    </>
  );
}