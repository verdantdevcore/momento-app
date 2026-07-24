"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Play, Heart, Camera } from "@phosphor-icons/react";

const BASE = "/use-cases/collect-wedding-guest-photos";

const floatingCards = [
  { image: `${BASE}/hero-card-first-kiss.jpg`, label: "First Kiss", author: "Guest · Sarah M.", position: "top-[6%] left-[1%]", rotate: "-5deg", delay: 0.3 },
  { image: `${BASE}/hero-card-bride-getting-ready.jpg`, label: "Bride Getting Ready", author: "Guest · Emma L.", position: "top-[4%] right-[1%]", rotate: "5deg", delay: 0.45 },
  { image: `${BASE}/hero-card-dance-floor.jpg`, label: "Dance Floor", author: "Guest · James K.", position: "bottom-[20%] left-[0%]", rotate: "4deg", delay: 0.55 },
  { image: `${BASE}/hero-card-family-moment.jpg`, label: "Family Moment", author: "Guest · Michael T.", position: "bottom-[18%] right-[0%]", rotate: "-4deg", delay: 0.65 },
];

const stats = [
  { value: "847", label: "Photos Collected" },
  { value: "312", label: "Guests Contributed" },
  { value: "1,240", label: "Memories Saved" },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDFBF7 0%, #FAF3E4 45%, #EEF2E6 100%)" }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full mb-6"
              style={{ background: "rgba(85,107,47,0.10)", padding: "7px 16px" }}
            >
              <Heart size={15} weight="fill" className="text-[#556B2F]" />
              <span className="text-[#556B2F]" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Trusted by 50,000+ Couples
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[#1A2410]"
              style={{ fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.75rem)", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20 }}
            >
              Every Guest Captures a{" "}
              <span style={{ color: "#556B2F", fontStyle: "italic" }}>Different Part</span>{" "}
              of Your Wedding Story
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#5A5A5A] max-w-xl mx-auto lg:mx-0"
              style={{ fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.65, marginBottom: 32 }}
            >
              Your photographer captures the big moments. Your guests capture the laughter,
              surprises, and happy tears. Collect everything in one beautiful shared album.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{ background: "#556B2F", padding: "16px 28px", fontWeight: 600, fontSize: "1rem", boxShadow: "0 8px 24px rgba(85,107,47,0.28)" }}
              >
                Start Collecting Wedding Photos
                <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#stories"
                className="group inline-flex items-center justify-center gap-2 rounded-full text-[#2C3A1E] transition-all hover:bg-[#556B2F]/5"
                style={{ border: "1px solid rgba(85,107,47,0.3)", padding: "16px 24px", fontWeight: 500, fontSize: "1rem" }}
              >
                <span className="inline-flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: "rgba(85,107,47,0.1)" }}>
                  <Play size={12} weight="fill" className="text-[#556B2F] ml-0.5" />
                </span>
                Watch Real Wedding Stories
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-8 justify-center lg:justify-start"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-[#1A2410]" style={{ fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.1 }}>{stat.value}</div>
                  <div className="text-[#7A7A7A]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: photo collage */}
          <div className="relative h-[520px] md:h-[620px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative w-[290px] md:w-[340px] h-[400px] md:h-[470px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image src={`${BASE}/hero-main.jpg`} alt="Wedding couple dancing joyfully at their reception" fill className="object-cover" sizes="(max-width: 768px) 290px, 340px" priority />
            </motion.div>

            {floatingCards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: card.delay }}
                className={`absolute ${card.position} hidden sm:block`}
                style={{ transform: `rotate(${card.rotate})` }}
              >
                <div className="w-32 md:w-40 bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="relative h-20 md:h-24 overflow-hidden">
                    <Image src={card.image} alt={card.label} fill className="object-cover" sizes="160px" />
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[#1A2410] truncate" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{card.label}</p>
                    <p className="text-[#9A9A9A] truncate" style={{ fontSize: "0.65rem" }}>{card.author}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Momento Gallery bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[280px] md:w-[320px]"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 34, height: 34, background: "#556B2F" }}>
                  <Camera size={17} className="text-white" />
                </span>
                <div className="min-w-0">
                  <div className="text-[#1A2410] truncate" style={{ fontSize: "0.85rem", fontWeight: 700 }}>Momento Gallery</div>
                  <div className="text-[#7A7A7A] truncate" style={{ fontSize: "0.75rem" }}>847 memories collected</div>
                </div>
                <div className="ml-auto flex -space-x-2 shrink-0">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="rounded-full border-2 border-white" style={{ width: 24, height: 24, background: "#F7E7CE" }} />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="rounded-full" style={{ width: 380, height: 380, opacity: 0.25, background: "radial-gradient(circle, #F7E7CE 0%, transparent 70%)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
