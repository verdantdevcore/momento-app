"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Camera, Users, Plus, ArrowRight } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const photographerItems = [
  "Planned and posed portraits",
  "Ceremony highlights and key moments",
  "Formal family compositions",
  "Polished, professionally edited photos",
  "Comprehensive first look coverage",
  "Professional lighting and equipment",
];

const guestItems = [
  "Behind-the-scenes getting-ready moments",
  "Fun, unscripted guest reactions",
  "Dance floor energy and movement",
  "Family laughter and private conversations",
  "Children playing and candid joy",
  "Unexpected and irreplaceable moments",
];

export function PhotographerGuest() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The complete wedding story"
          title="Photographer + guests = One complete story"
          subtitle="Professional photography and guest contributions aren't competing — they're complementary. Together they create the most complete wedding story possible."
        />

        {/* Photographer block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="mt-12 rounded-3xl overflow-hidden shadow-md bg-white"
          style={{ border: "1px solid #F0F0EC" }}
        >
          <div className="relative overflow-hidden" style={{ height: 200 }}>
            <Image src={`${BASE}/pg-photographer.jpg`} alt="Professional wedding photographer capturing the bride and groom" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
          </div>
          <ul className="p-6 md:p-8 space-y-3">
            {photographerItems.map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: "#F7E7CE" }}>
                  <Camera size={13} className="text-[#556B2F]" />
                </span>
                <span className="text-[#3A3A3A]" style={{ fontSize: "0.92rem" }}>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Together divider */}
        <div className="flex flex-col items-center py-8">
          <span className="inline-flex items-center justify-center rounded-full shadow-md" style={{ width: 44, height: 44, background: "#556B2F" }}>
            <Plus size={20} className="text-white" weight="bold" />
          </span>
          <span style={{ width: 1, height: 40, background: "rgba(85,107,47,0.2)" }} />
          <span className="text-[#556B2F]" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", writingMode: "vertical-rl" }}>TOGETHER</span>
          <span style={{ width: 1, height: 40, background: "rgba(85,107,47,0.2)" }} />
        </div>

        {/* Guests block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden shadow-md"
          style={{ border: "1px solid rgba(85,107,47,0.12)" }}
        >
          <div className="relative overflow-hidden" style={{ height: 200 }}>
            <Image src={`${BASE}/pg-guests.jpg`} alt="Wedding guests capturing candid moments with their phones" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
          </div>
          <ul className="p-6 md:p-8 space-y-3" style={{ background: "#F8FAF5" }}>
            {guestItems.map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: "rgba(85,107,47,0.12)" }}>
                  <Users size={13} className="text-[#556B2F]" />
                </span>
                <span className="text-[#3A3A3A]" style={{ fontSize: "0.92rem" }}>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Unity pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full text-white" style={{ background: "#556B2F", padding: "14px 26px" }}>
            <Camera size={17} className="text-[#F7E7CE]" />
            <Plus size={13} className="text-[#F7E7CE]/70" weight="bold" />
            <Users size={17} className="text-[#F7E7CE]" />
            <ArrowRight size={15} className="text-[#F7E7CE]/70" weight="bold" />
            <span className="text-[#F7E7CE]" style={{ fontWeight: 600, fontSize: "0.95rem" }}>One Complete Wedding Story</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
