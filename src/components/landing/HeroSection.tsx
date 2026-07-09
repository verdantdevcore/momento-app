"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const PHOTOS = [
  { url: "https://images.unsplash.com/photo-1612599542558-f3022089fb38?w=400&q=80", label: "Sarah's Wedding", rotate: "-6deg", style: { top: "5%", left: "0%" } },
  { url: "https://images.unsplash.com/photo-1544155892-b2b6c64204fc?w=400&q=80", label: "Jake's Birthday", rotate: "5deg", style: { top: "0%", right: "2%" } },
  { url: "https://images.unsplash.com/photo-1714972383523-7c636d2f0e9b?w=400&q=80", label: "New Year's Eve", rotate: "-3deg", style: { bottom: "8%", left: "3%" } },
  { url: "https://images.unsplash.com/photo-1758270703721-b1e61dbccd47?w=400&q=80", label: "Class of 2026", rotate: "4deg", style: { bottom: "5%", right: "0%" } },
];

function FloatingCard({ photo, index }: { photo: (typeof PHOTOS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 + index * 0.15, ease: "easeOut" }}
      className="absolute w-44 md:w-48 rounded-2xl overflow-hidden shadow-2xl"
      style={{ ...photo.style, transform: `rotate(${photo.rotate})` }}
    >
      <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
        <Image src={photo.url} alt={photo.label} fill className="object-cover" unoptimized />
      </div>
      <div className="px-3 py-2 bg-white">
        <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "#556B2F" }}>{photo.label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p style={{ fontSize: "0.65rem", color: "#888" }}>Live</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f5ef 0%, #fff 50%, #f3f7ee 100%)" }}>
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#556B2F" }} />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#F7E7CE" }} />

      <div className="max-w-6xl w-full mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col gap-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 self-center md:self-start px-4 py-1.5 rounded-full text-sm" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>
            <span>✨</span> Event memory collection platform
          </div>

          <h1 style={{ fontWeight: 800, fontSize: "clamp(2.25rem, 5vw, 3.35rem)", lineHeight: 1.15, color: "#1a1a1a" }}>
            All Your Event Memories,{" "}
            <span style={{ color: "#556B2F" }}>Together in One Place</span>
          </h1>

          <p className="self-center md:self-start" style={{ fontWeight: 400, fontSize: "1.1rem", lineHeight: 1.7, color: "#555", maxWidth: "480px" }}>
            Momento App makes it easy for hosts and guests to instantly capture, share, and relive memorable photos and videos from every special event — privately and effortlessly.
          </p>
          <p style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.7, color: "#555", maxWidth: "480px" }}>
            No App Downloads • Guests Join via QR or Link • No Chasing People Afterward
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center md:items-start">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-full transition-all hover:opacity-90 hover:scale-105"
              style={{ fontWeight: 700, fontSize: "1rem", background: "#556B2F", color: "#F7E7CE", boxShadow: "0 4px 24px rgba(85,107,47,0.3)", textDecoration: "none" }}
            >
              Create Your Event
            </Link>
            <button
              onClick={() => scrollTo("#how-it-works")}
              className="px-8 py-4 rounded-full cursor-pointer transition-all hover:opacity-80"
              style={{ fontWeight: 600, fontSize: "1rem", background: "transparent", color: "#556B2F", border: "2px solid #556B2F" }}
            >
              See How It Works
            </button>
          </div>

          <div className="flex items-center gap-6 justify-center md:justify-start mt-2">
            <div className="flex -space-x-2">
              {["https://images.unsplash.com/photo-1612599542558-f3022089fb38?w=40&h=40&fit=crop", "https://images.unsplash.com/photo-1714972383523-7c636d2f0e9b?w=40&h=40&fit=crop", "https://images.unsplash.com/photo-1544155892-b2b6c64204fc?w=40&h=40&fit=crop", "https://images.unsplash.com/photo-1758270703721-b1e61dbccd47?w=40&h=40&fit=crop"].map((src, i) => (
                <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              <strong style={{ color: "#556B2F" }}>500+</strong> events captured
            </p>
          </div>
        </motion.div>

        {/* Desktop floating cards */}
        <div className="relative h-[480px] hidden md:block">
          {PHOTOS.map((photo, i) => <FloatingCard key={i} photo={photo} index={i} />)}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 rounded-3xl overflow-hidden shadow-2xl z-10">
            <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
              <Image src="https://images.unsplash.com/photo-1723373457175-31b09fa7d405?w=400&q=80" alt="Event album" fill className="object-cover" unoptimized />
            </div>
            <div className="px-4 py-3 bg-white">
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a1a" }}>Family Reunion 2026</p>
              <p style={{ fontSize: "0.75rem", color: "#888" }}>48 photos · 12 guests</p>
            </div>
          </motion.div>
        </div>

        {/* Mobile image */}
        <div className="md:hidden w-full">
          <div className="rounded-3xl overflow-hidden shadow-xl w-full max-w-sm mx-auto relative" style={{ aspectRatio: "16/9" }}>
            <Image src="https://images.unsplash.com/photo-1612599542558-f3022089fb38?w=600&q=80" alt="Event memories" fill className="object-cover" unoptimized />
          </div>
        </div>
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 flex flex-col items-center gap-1">
        <p style={{ fontSize: "0.75rem", color: "#999" }}>Scroll to explore</p>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 8L10 13L15 8" stroke="#556B2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
