"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, ArrowRight, Play, QrCode } from "@phosphor-icons/react";

const AVATARS = ["/use-cases/wedding/avatar-1.jpg", "/use-cases/wedding/avatar-2.jpg", "/use-cases/wedding/avatar-3.jpg", "/use-cases/wedding/avatar-4.jpg"];

const GRID = Array.from({ length: 9 }, (_, i) => `/use-cases/wedding/grid-${i + 1}.jpg`);

// The four tilted photos flanking the phone. The phone is a fixed 288px, so these
// are positioned from the column edges and only shown once there is room beside
// it — below `xl` the column is too narrow and they would sit on top of the phone.
const POLAROIDS = [
  { src: "/use-cases/wedding/polaroid-bride-bouquet.jpg", alt: "Bride with bouquet", w: 104, rotate: -8, style: { top: "6%", left: 0 } },
  { src: "/use-cases/wedding/polaroid-first-dance.jpg", alt: "First dance at sunset", w: 112, rotate: 6, style: { top: "3%", right: 0 } },
  { src: "/use-cases/wedding/polaroid-bouquet.jpg", alt: "Wedding bouquet", w: 88, rotate: 5, style: { bottom: "14%", left: 0 } },
  { src: "/use-cases/wedding/polaroid-cake.jpg", alt: "Wedding cake", w: 104, rotate: -5, style: { bottom: "10%", right: 0 } },
];

function PhoneMockup() {
  return (
    <div
      className="relative bg-white overflow-hidden"
      style={{ width: 288, maxWidth: "100%", border: "6.8px solid #1A1A1A", borderRadius: 40, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
    >
      {/* Status bar sits flush to the frame stroke (Figma phone 2:3488 has no
          padding), so its black merges with the border into one rounded top —
          no white gap around the notch. */}
      <div className="flex items-center justify-center" style={{ background: "#1A1A1A", height: 28 }}>
        <span style={{ background: "#333", width: 80, height: 16, borderRadius: 999 }} />
      </div>

      <div className="bg-white p-3">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "15px" }}>Emma &amp; James</p>
            <p style={{ fontSize: "0.5625rem", color: "#888", lineHeight: "13.5px" }}>247 photos · 18 guests</p>
          </div>
          <span className="flex items-center justify-center" style={{ background: "#F7E7CE", width: 32, height: 32, borderRadius: 10 }}>
            <QrCode size={16} color="#556B2F" />
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1">
          {GRID.map((src, i) => (
            <div key={src} className="relative" style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
              <Image src={src} alt={`Wedding photo ${i + 1}`} fill className="object-cover" sizes="81px" />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center" style={{ background: "#556B2F", borderRadius: 14, padding: "10px 0" }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "#fff", lineHeight: "15px" }}>Upload Your Photos</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  // Solid cream base first — the design's gradient stops are semi-transparent
  // and wash out to grey without something opaque underneath.
  return (
    <section className="relative overflow-hidden" style={{ background: "#FDFAF6" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(149deg, rgba(247,231,206,0.4) 0%, #FDFAF6 50%, rgba(232,240,216,0.3) 100%)" }}
      />
      {/* The design layers faint floral line art here at 10% opacity; approximated
          with soft tints rather than vendoring nine decorative SVGs. Kept small and
          low-opacity so they tint the corners instead of greying the whole section. */}
      <div className="absolute rounded-full pointer-events-none" style={{ background: "rgba(247,231,206,0.45)", width: 320, height: 320, top: -110, right: -110, filter: "blur(70px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ background: "rgba(232,240,216,0.5)", width: 280, height: 280, bottom: -90, left: -110, filter: "blur(70px)" }} />

      <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-32 pb-20 lg:pt-36">
        {/* Copy */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full self-start"
            style={{ background: "#F7E7CE", border: "1.36px solid #E8D4AE", padding: "9px 17px" }}
          >
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} size={10} weight="fill" color="#E8B33A" />
              ))}
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#556B2F", lineHeight: "16px" }}>Loved by 10,000+ Couples</span>
          </div>

          {/* Inline type: globals.css has unlayered h1..h5 rules that beat Tailwind utilities. */}
          <h1 style={{ fontSize: "clamp(2.5rem, 5.2vw, 4rem)", fontWeight: 800, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            The Wedding Photo Sharing App That <span style={{ color: "#556B2F" }}>Captures Every Memory</span>
          </h1>

          <p className="max-w-lg" style={{ fontSize: "1.1rem", color: "#5A5A5A", lineHeight: "28.6px" }}>
            Collect every wedding photo and video in one beautiful shared album. Guests simply scan your QR code and
            upload instantly—no app download required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "#556B2F", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "14px 28px", textDecoration: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            >
              Create Your Wedding Album
              <ArrowRight size={16} weight="bold" />
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all hover:opacity-90"
              style={{ background: "#fff", border: "1.36px solid #E0D9D0", padding: "15px 29px" }}
            >
              <Play size={14} weight="fill" color="#2A2A2A" />
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "#2A2A2A" }}>Watch Demo</span>
            </button>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex">
              {AVATARS.map((src, i) => (
                <span
                  key={src}
                  className="relative rounded-full overflow-hidden"
                  style={{ width: 36, height: 36, border: "1.36px solid #fff", marginLeft: i === 0 ? 0 : -10, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="36px" />
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "20px" }}>
              <span style={{ fontWeight: 600, color: "#1A1A1A" }}>500K+</span> photos shared this year
            </p>
          </div>
        </motion.div>

        {/* Phone with scattered polaroids */}
        <motion.div
          className="relative flex justify-center items-center min-h-[600px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          {POLAROIDS.map((p, i) => (
            <motion.div
              key={p.src}
              className="absolute hidden xl:block"
              style={{ ...p.style, width: p.w, transform: `rotate(${p.rotate}deg)`, borderRadius: 14, border: "1.36px solid rgba(255,255,255,0.8)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", overflow: "hidden" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 + i * 0.12, ease: "easeOut" }}
            >
              <div className="relative w-full" style={{ aspectRatio: "112/141" }}>
                <Image src={p.src} alt={p.alt} fill className="object-cover" sizes="128px" />
              </div>
            </motion.div>
          ))}

          <PhoneMockup />

          {/* QR card */}
          <motion.div
            className="absolute hidden md:flex flex-col items-center bg-white"
            style={{ right: "16%", bottom: "8%", width: 144, padding: 17, borderRadius: 16, border: "1.36px solid #F7E7CE", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          >
            <span className="flex items-center justify-center w-full" style={{ background: "#F7E7CE", borderRadius: 14, padding: 12 }}>
              <QrCode size={48} color="#556B2F" />
            </span>
            <p className="mt-2 text-center" style={{ fontSize: "0.625rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "15px" }}>Emma &amp; James</p>
            <p className="text-center" style={{ fontSize: "0.5625rem", color: "#888", lineHeight: "13.5px" }}>Scan to share photos</p>
          </motion.div>

          {/* Upload toast */}
          <motion.div
            className="absolute hidden md:flex items-center gap-2.5 bg-white"
            style={{ left: "-2%", bottom: "2%", maxWidth: 170, padding: 13, borderRadius: 16, border: "1.36px solid #E8E0D8", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.95, ease: "easeOut" }}
          >
            <span className="flex items-center justify-center shrink-0" style={{ background: "#F7E7CE", width: 32, height: 32, borderRadius: 999, fontSize: 14 }}>
              📸
            </span>
            <span>
              <span className="block" style={{ fontSize: "0.625rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "15px" }}>Sarah uploaded 12 photos</span>
              <span className="block" style={{ fontSize: "0.5625rem", color: "#888", lineHeight: "13.5px" }}>just now</span>
            </span>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative flex flex-col items-center gap-2 pb-10">
        <p style={{ fontSize: "0.75rem", color: "#9A9A9A", lineHeight: "16px" }}>Scroll to explore</p>
        <span className="flex items-start justify-center" style={{ width: 20, height: 32, border: "1.36px solid #CCC", borderRadius: 999, padding: 5 }}>
          <motion.span
            style={{ background: "#999", width: 4, height: 8, borderRadius: 999 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
