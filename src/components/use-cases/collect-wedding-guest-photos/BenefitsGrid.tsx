"use client";

import { motion } from "motion/react";
import type { Icon } from "@phosphor-icons/react";
import { Eye, Sparkle, Globe, FilmStrip, DownloadSimple, Shield, Smiley } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const CREAM = "#F7E7CE";
const SAGE = "#EEF2E6";

// NOTE: Figma frame 2:10989 lists "Videos Included" twice (cards 4 and 5, both
// sage tiles, identical copy) and omits an "Upload Anytime" card that earlier
// drafts had. Reproduced verbatim to match the design; flagged to the team.
const benefits: { icon: Icon; title: string; description: string; color: string }[] = [
  { icon: Eye, title: "Discover Unseen Moments", description: "Find candid photos and videos you never knew existed — stolen glances, joyful tears, and laughter only guests could capture.", color: CREAM },
  { icon: Sparkle, title: "Preserve Candid Memories", description: "Raw, authentic, unposed. Guest photos capture real emotion in ways a posed portrait never could.", color: SAGE },
  { icon: Globe, title: "Every Perspective in One Place", description: "Relive your wedding through every guest's eyes — from grandparents watching proudly to children dancing freely.", color: CREAM },
  { icon: FilmStrip, title: "Videos Included", description: "Guests upload videos alongside photos — capturing speeches, dance moves, and heartfelt moments in motion.", color: SAGE },
  { icon: FilmStrip, title: "Videos Included", description: "Guests upload videos alongside photos — capturing speeches, dance moves, and heartfelt moments in motion.", color: SAGE },
  { icon: DownloadSimple, title: "Easy High-Res Downloads", description: "Download every photo and video in full resolution — individually or as a complete collection — anytime.", color: SAGE },
  { icon: Shield, title: "Private & Secure", description: "Your wedding album is completely private. Only guests with your unique link can contribute.", color: CREAM },
  { icon: Smiley, title: "No App for Guests", description: "Guests tap a link or scan a QR code. No download, no sign-up — just beautiful memories shared instantly.", color: SAGE },
];

export function BenefitsGrid() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Why couples love it"
          title="Everything you need to preserve every memory"
          subtitle="Designed for couples who know the most meaningful wedding photos are still on their guests' phones."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              className="group bg-white rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ border: "1px solid #F0F0EC" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ width: 44, height: 44, background: benefit.color }}
              >
                <benefit.icon size={22} className="text-[#556B2F]" />
              </span>
              <h3 className="text-[#1A2410] mb-2" style={{ fontWeight: 600, fontSize: "1.05rem" }}>{benefit.title}</h3>
              <p className="text-[#5A5A5A]" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
