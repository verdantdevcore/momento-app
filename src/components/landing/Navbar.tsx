"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GreenLogo } from "./Logo";

const links = [
  { label: "Features", hash: "#features" },
  { label: "How It Works", hash: "#how-it-works" },
  { label: "FAQs", hash: "#faqs" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSectionLink(hash: string) {
    setMenuOpen(false);
    if (pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/" + hash);
    }
  }

  const isLegalPage = pathname !== "/";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled || isLegalPage ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled || isLegalPage ? "blur(12px)" : "none",
        boxShadow: scrolled || isLegalPage ? "0 1px 24px rgba(85,107,47,0.08)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" style={{ display: "block" }}>
          <GreenLogo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleSectionLink(link.hash)}
              className="bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
              style={{ fontWeight: 500, fontSize: "0.95rem", color: "#556B2F" }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleSectionLink("#final-cta")}
            className="px-5 py-2 rounded-full border-none cursor-pointer transition-all hover:opacity-90 hover:scale-105"
            style={{ fontWeight: 600, fontSize: "0.95rem", background: "#556B2F", color: "#F7E7CE" }}
          >
            Get Started
          </button>
        </div>

        <button
          className="md:hidden bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: "#556B2F" }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.98)" }}>
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleSectionLink(link.hash)}
              className="bg-transparent border-none cursor-pointer text-left"
              style={{ fontWeight: 500, color: "#556B2F", fontSize: "1rem" }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleSectionLink("#final-cta")}
            className="w-full py-3 rounded-full border-none cursor-pointer"
            style={{ fontWeight: 600, background: "#556B2F", color: "#F7E7CE" }}
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
