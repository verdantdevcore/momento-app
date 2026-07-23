"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, QrCode, UploadSimple } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const STEPS = [
  {
    step: "STEP 01",
    icon: BookOpen,
    title: "Create Your Wedding Album",
    body: "Set up your private shared album in minutes. Add your names, wedding date, and personalize it for your special day.",
    image: "/use-cases/wedding/step-create-album.jpg",
    alt: "Ceremony in a candlelit venue",
  },
  {
    step: "STEP 02",
    icon: QrCode,
    title: "Print Your QR Code",
    body: "Download your custom QR code and add it to your wedding table cards, welcome signs, and reception posters.",
    image: "/use-cases/wedding/step-print-qr.jpg",
    alt: "Reception table set with flowers",
  },
  {
    step: "STEP 03",
    icon: UploadSimple,
    title: "Guests Scan & Upload Instantly",
    body: "Guests simply scan the QR code and upload from their camera roll. No app download, no login—it just works.",
    image: "/use-cases/wedding/step-guests-upload.jpg",
    alt: "Couple dancing at sunset",
  },
];

export function SolutionSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          badge="The solution"
          title={
            <>
              One QR code. <span style={{ color: "#556B2F" }}>Every memory.</span>
            </>
          }
          subtitle="Momento App makes it effortless for every wedding guest to contribute their photos — no tech skills required."
        />

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                className="overflow-hidden bg-white"
                style={{ borderRadius: 24, border: "1.36px solid #E8E0D8" }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              >
                <div className="relative" style={{ aspectRatio: "384/208" }}>
                  <Image src={s.image} alt={s.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 384px" />
                </div>

                <div style={{ padding: 24 }}>
                  <div className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 40, height: 40, borderRadius: 14, background: "#F7E7CE", border: "1.36px solid #E8D4AE" }}
                    >
                      <Icon size={18} color="#556B2F" />
                    </span>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#BBB", letterSpacing: "1.2px", lineHeight: "16px" }}>
                        {s.step}
                      </p>
                      {/* DM Serif Display is the wedding page's display face — loaded on
                          the route, so fall back to a generic serif if it hasn't landed. */}
                      <h3
                        className="mt-0.5"
                        style={{
                          fontFamily: "var(--font-dm-serif), serif",
                          fontSize: "1.2rem",
                          fontWeight: 400,
                          color: "#1A1A1A",
                          lineHeight: "23px",
                        }}
                      >
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4" style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "22.75px" }}>
                    {s.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: "#556B2F",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "16px 32px",
              textDecoration: "none",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
            }}
          >
            Start for Free — No Credit Card Required
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
