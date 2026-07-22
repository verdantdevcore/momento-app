"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { QrCode, ArrowRight } from "@phosphor-icons/react";

export function FinalCta() {
  return (
    <section
      className="py-24"
      style={{ background: "linear-gradient(155deg, #3D4F22 0%, #556B2F 50%, #6B8A3A 100%)" }}
    >
      <motion.div
        className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span
          className="flex items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.15)", width: 64, height: 64 }}
        >
          <QrCode size={32} color="#fff" />
        </span>

        <h2
          className="mt-8"
          style={{ fontSize: "clamp(2rem, 4.4vw, 3.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}
        >
          Every Event Deserves One Shared Album
        </h2>

        <p className="mt-8 max-w-2xl" style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.8)", lineHeight: "30.6px" }}>
          Collect every attendee&apos;s photos and videos in one secure place with a single QR code. Fast for guests,
          effortless for organizers, and beautifully organized with Momento App.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#fff", color: "#556B2F", fontWeight: 700, fontSize: "1rem", padding: "16px 32px", textDecoration: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
          >
            Create Your Event Album
            <ArrowRight size={16} weight="bold" />
          </Link>

          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-2xl transition-all hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.15)", border: "1.36px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "17px 33px", textDecoration: "none" }}
          >
            Start Free
          </Link>
        </div>

        <p className="mt-8" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", lineHeight: "19.5px" }}>
          No credit card required · Free forever plan available
        </p>
      </motion.div>
    </section>
  );
}
