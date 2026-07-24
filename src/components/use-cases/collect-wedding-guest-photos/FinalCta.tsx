"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Heart, Camera } from "@phosphor-icons/react";

const BASE = "/use-cases/collect-wedding-guest-photos";

const trust = ["No credit card required", "Free plan available", "Setup in 60 seconds", "Cancel anytime"];

export function FinalCta() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden" style={{ background: "linear-gradient(160deg, #1A2410 0%, #2C3A1E 50%, #3D5220 100%)" }}>
      <div className="absolute inset-0">
        <Image src={`${BASE}/cta-ceremony.jpg`} alt="" aria-hidden fill className="object-cover" style={{ opacity: 0.2 }} sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(26,36,16,0.95) 0%, rgba(44,58,30,0.90) 60%, rgba(61,82,32,0.85) 100%)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <span className="inline-flex items-center justify-center rounded-full" style={{ width: 48, height: 48, background: "rgba(247,231,206,0.1)", border: "1px solid rgba(247,231,206,0.2)" }}>
              <Camera size={24} className="text-[#F7E7CE]" />
            </span>
          </div>

          <h2 style={{ color: "#F7E7CE", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}>
            Every Guest Holds a Piece of{" "}
            <span style={{ color: "#ffffff", fontStyle: "italic" }}>Your Wedding Story</span>
          </h2>

          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.05rem", lineHeight: 1.65, marginBottom: 40 }}>
            Don&rsquo;t let unforgettable memories stay hidden on your guests&rsquo; phones. Collect every smile, every laugh, and every heartfelt moment in one beautiful shared album.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: "#F7E7CE", color: "#2C3A1E", padding: "16px 30px", fontWeight: 600, fontSize: "1rem" }}
            >
              Start Collecting Wedding Photos
              <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full text-white transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "16px 30px", fontWeight: 500, fontSize: "1rem" }}
            >
              <Heart size={17} className="text-[#F7E7CE]" />
              Create Free Wedding Album
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
            {trust.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="rounded-full" style={{ width: 4, height: 4, background: "rgba(247,231,206,0.4)" }} />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
