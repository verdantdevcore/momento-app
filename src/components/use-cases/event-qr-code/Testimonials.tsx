"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { SectionHeading } from "./SectionHeading";

const TESTIMONIALS = [
  {
    quote:
      "We had 600 attendees at our annual summit, and Momento's App QR code collected over 1,200 photos by the end of the day. Setup took five minutes. It was by far the easiest photo collection experience we've ever had — guests loved it.",
    name: "Sarah Mitchell",
    role: "Event Director, Apex Conferences",
    avatar: "/use-cases/sarah-mitchell.jpg",
  },
  {
    quote:
      "I've tried email threads, WhatsApp groups, and Google Drive — nothing comes close to Momento App. One QR code on the welcome sign and the album fills itself in real time. My clients always ask me to use it again.",
    name: "James Okafor",
    role: "Wedding & Events Planner",
    avatar: "/use-cases/james-okafor.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(155deg, #F0F4E8 0%, #F9F7F3 50%, #F7E7CE 100%)" }}>
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading badge="Testimonials" title="Organizers love Momento App" />

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              className="bg-white rounded-3xl p-8 m-0"
              style={{ border: "1.36px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 12px rgba(85,107,47,0.08)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={16} weight="fill" color="#E8B33A" />
                ))}
              </div>

              <blockquote className="mt-5 m-0" style={{ fontSize: "1rem", fontStyle: "italic", color: "#333", lineHeight: "26px" }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3">
                <span className="relative rounded-full overflow-hidden shrink-0" style={{ width: 48, height: 48, border: "1.36px solid rgba(85,107,47,0.2)" }}>
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="48px" />
                </span>
                <span>
                  <span className="block" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "22.5px" }}>
                    {t.name}
                  </span>
                  <span className="block" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#888", lineHeight: "19.5px" }}>
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
