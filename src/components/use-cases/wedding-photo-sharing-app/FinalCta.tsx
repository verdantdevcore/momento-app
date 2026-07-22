"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, ArrowRight } from "@phosphor-icons/react";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      {/* Same golden-hour embrace used as the last gallery tile, dimmed under an
          olive wash so the reversed-out copy stays legible. */}
      <Image
        src="/use-cases/wedding/gal-couple-embrace.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(61,79,34,0.86) 0%, rgba(85,107,47,0.82) 55%, rgba(45,58,24,0.9) 100%)" }} />

      {/* Faint blurred blobs echoing the design's corner floral art */}
      <div className="absolute rounded-full pointer-events-none" style={{ background: "rgba(232,240,216,0.12)", width: 260, height: 200, top: -40, left: -60, filter: "blur(50px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ background: "rgba(247,231,206,0.12)", width: 300, height: 220, bottom: -60, right: -60, filter: "blur(55px)" }} />

      <motion.div
        className="relative max-w-3xl mx-auto px-6 py-32 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", border: "1.36px solid rgba(255,255,255,0.25)", padding: "9px 18px" }}
        >
          <Heart size={14} weight="fill" color="#F7E7CE" />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", lineHeight: "18px" }}>Join 10,000+ Happy Couples</span>
        </span>

        <h2
          className="mt-8"
          style={{ fontSize: "clamp(2.25rem, 4.6vw, 3.75rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.01em" }}
        >
          Every Wedding Memory Deserves{" "}
          <span style={{ color: "#F7E7CE" }}>One Beautiful Home</span>
        </h2>

        <p className="mt-6 max-w-xl" style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.85)", lineHeight: "30.6px" }}>
          Create your wedding album today and let every guest contribute to your story. Free to get started — no credit
          card required.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 700, fontSize: "1rem", padding: "16px 32px", textDecoration: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)" }}
          >
            Create Your Wedding Album
            <ArrowRight size={16} weight="bold" />
          </Link>

          <Link
            href="/use-cases/wedding-photo-sharing-app#how-it-works"
            className="inline-flex items-center justify-center rounded-full transition-all hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.12)", border: "1.36px solid rgba(255,255,255,0.35)", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "17px 33px", textDecoration: "none" }}
          >
            Learn More
          </Link>
        </div>

        <p className="mt-8" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.65)", lineHeight: "19.5px" }}>
          Free plan available · No app download required · Works in 100+ countries
        </p>
      </motion.div>
    </section>
  );
}
