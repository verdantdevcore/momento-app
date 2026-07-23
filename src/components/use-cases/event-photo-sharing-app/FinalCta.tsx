"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck } from "@phosphor-icons/react";

const COLLAGE = [
  "/use-cases/event/conference-audience.jpg",
  "/use-cases/event/festival.jpg",
  "/use-cases/event/graduation.jpg",
  "/use-cases/event/charity-gala.jpg",
];

const TRUST = ["50,000+ Events Hosted", "No App Download", "5 Minute Setup", "99.9% Uptime"];

export function FinalCta() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#1a1a1a", padding: "120px 24px" }}>
      {/* Background collage */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", opacity: 0.15, zIndex: 0 }} aria-hidden>
        {COLLAGE.map((src, i) => (
          <div key={i} className="relative">
            <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(85,107,47,0.85) 0%, rgba(26,26,26,0.9) 100%)", zIndex: 1 }} />

      {/* QR motif borders */}
      <div className="absolute" style={{ bottom: -60, right: -60, width: 300, height: 300, borderRadius: 40, border: "3px solid rgba(255,255,255,0.08)", zIndex: 1 }} aria-hidden />
      <div className="absolute" style={{ top: -40, left: -40, width: 200, height: 200, borderRadius: 40, border: "3px solid rgba(255,255,255,0.06)", zIndex: 1 }} aria-hidden />

      <motion.div
        className="relative mx-auto text-center"
        style={{ maxWidth: 900, zIndex: 2 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "8px 18px", marginBottom: 32, border: "1px solid rgba(255,255,255,0.2)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Free to get started &middot; No credit card</span>
        </div>

        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 24 }}>
          Every Event Deserves
          <br />
          <span style={{ color: "#c8d8b0" }}>One Shared Story</span>
        </h2>

        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.75, maxWidth: 640, margin: "0 auto 48px" }}>
          Bring every attendee&apos;s perspective together in one secure album. Whether you&apos;re organizing a conference,
          celebration, or community event, Momento App makes collecting memories effortless.
        </p>

        <div className="flex flex-wrap justify-center" style={{ gap: 16 }}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/auth/register" className="inline-flex items-center gap-2" style={{ background: "#fff", color: "#556B2F", padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
              Create Your Event Album
              <ArrowRight size={18} weight="bold" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/contact" className="inline-flex items-center gap-2" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 600, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
              <CalendarCheck size={18} weight="regular" />
              Book a Demo
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center" style={{ gap: 32, marginTop: 48 }}>
          {TRUST.map((item) => (
            <div key={item} className="flex items-center" style={{ gap: 8 }}>
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#8BA84A" }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
