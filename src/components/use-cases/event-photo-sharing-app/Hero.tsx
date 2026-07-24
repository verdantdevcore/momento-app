"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play, UploadSimple, Image as ImageIcon, Users, Lightning } from "@phosphor-icons/react";

// The four hero tiles (Figma 2:10811) — the exact event photos the frame uses.
const EVENT_TILES = [
  { src: "/use-cases/event/conference-audience.jpg", label: "Conference", alt: "Business conference audience" },
  { src: "/use-cases/event/graduation.jpg", label: "Graduation", alt: "University graduation ceremony" },
  { src: "/use-cases/event/festival.jpg", label: "Festival", alt: "Music festival crowd" },
  { src: "/use-cases/event/networking.jpg", label: "Networking", alt: "Professional networking event" },
];

const FLOATING = [
  { Icon: UploadSimple, text: "12 photos uploaded", sub: "Just now", color: "#556B2F", pos: { top: -16, left: -20 } },
  { Icon: Users, text: "248 guests active", sub: "Live", color: "#8BA84A", pos: { top: "30%", right: -28 } },
  { Icon: ImageIcon, text: "Album ready", sub: "Shared link", color: "#556B2F", pos: { bottom: "28%", left: -28 } },
  { Icon: Lightning, text: "Instant upload", sub: "No app needed", color: "#8BA84A", pos: { bottom: -16, right: 20 } },
] as const;

const AVATARS = ["\u{1F469}‍\u{1F4BC}", "\u{1F468}‍\u{1F393}", "\u{1F469}‍\u{1F3A4}", "\u{1F468}‍\u{1F4BB}", "\u{1F469}‍\u{1F3EB}"];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f8f5f0 0%, #eef2e8 40%, #f7e7ce 100%)",
        minHeight: 820,
        display: "flex",
        alignItems: "center",
        padding: "128px 24px 64px",
      }}
    >
      {/* Organic blob background (Figma 2:10756) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute rounded-full" style={{ top: -100, right: -100, width: 500, height: 500, background: "rgba(85,107,47,0.06)" }} />
        <div className="absolute rounded-full" style={{ bottom: -80, left: -80, width: 400, height: 400, background: "rgba(247,231,206,0.6)" }} />
      </div>

      <div className="relative site-container grid items-center hero-grid" style={{ gap: "4rem" }}>
        {/* Left — copy */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{ background: "#eef2e8", border: "1px solid #c8d8b0", padding: "6px 14px", marginBottom: 24 }}
          >
            <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: "#556B2F" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#556B2F" }}>Trusted by 50,000+ events worldwide</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.15, color: "#1A1A1A", letterSpacing: "-0.5px", marginBottom: 24 }}>
            One App. <span style={{ color: "#556B2F" }}>Every Event.</span>
            <br />
            Every Memory.
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5A5A5A", maxWidth: 520, marginBottom: 36 }}>
            From conferences and corporate events to graduations, reunions, fundraisers, festivals, and private
            celebrations, Momento App makes it effortless to collect every attendee&apos;s photos and videos in one secure
            shared album.
          </p>

          <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 48 }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2"
                style={{ background: "#556B2F", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(85,107,47,0.3)" }}
              >
                Create Your Event Album
                <ArrowRight size={18} weight="bold" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="#live-gallery"
                className="inline-flex items-center gap-2"
                style={{ background: "#fff", color: "#1A1A1A", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1.5px solid #e0ddd8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <span className="flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: "#f5f0e8" }}>
                  <Play size={12} weight="fill" color="#556B2F" />
                </span>
                See Live Demo
              </Link>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 20 }}>
            <div className="flex">
              {AVATARS.map((emoji, i) => (
                <span
                  key={i}
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 34, height: 34, background: "#e8eddf", border: "2px solid #fff", marginLeft: i > 0 ? -10 : 0, fontSize: 16 }}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <div>
              <div className="flex" style={{ gap: 2, marginBottom: 2 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{ color: "#F59E0B", fontSize: 14 }}>&#9733;</span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>
                <strong style={{ color: "#1A1A1A" }}>4.9/5</strong> from 2,400+ event organizers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right — visual */}
        <motion.div
          className="relative hero-visual"
          style={{ height: 560 }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="grid h-full overflow-hidden" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, borderRadius: 20 }}>
            {EVENT_TILES.map((tile) => (
              <div key={tile.label} className="relative overflow-hidden">
                <Image src={tile.src} alt={tile.alt} fill className="object-cover" sizes="(max-width: 900px) 0px, 300px" />
                <div className="absolute" style={{ bottom: 10, left: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: 8, padding: "4px 10px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{tile.label}</span>
                </div>
              </div>
            ))}
          </div>

          {FLOATING.map(({ Icon, text, sub, color, pos }, i) => (
            <motion.div
              key={text}
              className="absolute flex items-center"
              style={{ ...pos, gap: 10, minWidth: 160, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.8)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
            >
              <span className="flex items-center justify-center shrink-0" style={{ width: 30, height: 30, borderRadius: 8, background: color, color: "#fff" }}>
                <Icon size={14} weight="bold" />
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{text}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}
