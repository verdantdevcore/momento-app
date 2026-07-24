"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const photos = [
  { src: `${BASE}/wall-beach-ceremony.jpg`, alt: "Newly wed couple on the aisle at a beach ceremony" },
  { src: `${BASE}/wall-first-dance.jpg`, alt: "Bride and groom sharing their first dance at the reception" },
  { src: `${BASE}/wall-family-table.jpg`, alt: "Family gathering around a reception table at a wedding" },
  { src: `${BASE}/wall-guests-dancing.jpg`, alt: "Guests dancing freely at a wedding reception" },
  { src: `${BASE}/wall-bride-gown.jpg`, alt: "Bride in a beautiful wedding gown with floral details" },
  { src: `${BASE}/wall-golden-hour.jpg`, alt: "Elegant couple standing in golden hour sunlight" },
];

export function MemoryWall() {
  return (
    <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #FCF6E9 50%, #FDFBF7 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Featured albums"
          title="Your wedding, beautifully organized"
          subtitle="Momento App automatically organizes every guest photo into beautiful shared albums — by moment, by time, by memory."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-10"
        >
          <p className="text-[#7A7A7A] mb-5" style={{ fontSize: "0.9rem" }}>
            Every photo in these albums was captured by a wedding guest — not the photographer.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full text-white transition-all hover:-translate-y-0.5"
            style={{ background: "#556B2F", padding: "14px 28px", fontWeight: 600, fontSize: "1rem", boxShadow: "0 8px 20px rgba(85,107,47,0.25)" }}
          >
            Create Your Wedding Album
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
