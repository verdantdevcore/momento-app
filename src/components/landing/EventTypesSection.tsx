"use client";

import Image from "next/image";
import { motion } from "motion/react";

const EVENTS = [
  { url: "https://images.unsplash.com/photo-1612599542558-f3022089fb38?w=400&q=80", label: "Weddings" },
  { url: "https://images.unsplash.com/photo-1714978444614-7a197c2309ee?w=400&q=80", label: "Birthdays" },
  { url: "https://images.unsplash.com/photo-1768489038182-7db6980fd841?w=400&q=80", label: "Graduations" },
  { url: "https://images.unsplash.com/photo-1723203812312-0b0ad8c142b6?w=400&q=80", label: "Family Gatherings" },
  { url: "https://images.unsplash.com/photo-1714972383523-7c636d2f0e9b?w=400&q=80", label: "Parties" },
  { url: "https://images.unsplash.com/photo-1473652502225-6b6af0664e32?w=400&q=80", label: "Corporate Events" },
];

export function EventTypesSection() {
  return (
    <section className="py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f5ef 0%, #f3f7ee 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>Every occasion</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>Perfect for every celebration</h2>
          <p style={{ fontSize: "1rem", color: "#666", maxWidth: "400px", margin: "0.75rem auto 0", lineHeight: 1.7 }}>From intimate gatherings to large corporate events — Momento App works for them all.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {EVENTS.map((event, i) => (
            <motion.div key={event.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="relative group overflow-hidden rounded-3xl cursor-pointer" style={{ aspectRatio: "4/3" }}>
              <Image src={event.url} alt={event.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              <div className="absolute inset-0 flex items-end p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{event.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-wrap gap-3 justify-center">
          {["Baby Showers", "Conferences", "School Events", "Celebrations"].map((ev) => (
            <span key={ev} className="px-5 py-2 rounded-full" style={{ fontWeight: 600, fontSize: "0.9rem", background: "#fff", color: "#556B2F", border: "1.5px solid rgba(85,107,47,0.2)" }}>
              {ev}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
