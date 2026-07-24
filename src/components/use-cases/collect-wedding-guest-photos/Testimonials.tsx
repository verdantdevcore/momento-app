"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star, Quotes } from "@phosphor-icons/react";

const BASE = "/use-cases/collect-wedding-guest-photos";

const testimonials = [
  {
    name: "Isabella Chen",
    role: "Bride",
    wedding: "The Chen-Williams Wedding",
    avatar: `${BASE}/avatar-isabella-chen.jpg`,
    highlight: "Found irreplaceable photos of a loved one",
    review: "My grandmother had taken photos of my grandfather dancing with me that I never knew existed. She passed away two months later. Those photos — captured by a guest and collected by Momento App — are the most treasured things I own.",
  },
  {
    name: "Daniel Reyes",
    role: "Wedding Photographer",
    wedding: "500+ Weddings Captured",
    avatar: `${BASE}/avatar-daniel-reyes.jpg`,
    highlight: "Loved by professional photographers too",
    review: "I was skeptical at first. But Momento App has actually increased my value to couples — they see guest uploads and appreciate the craft of professional photography even more. I recommend it to every couple I work with.",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #FCF7EC 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <span className="inline-flex items-center justify-center rounded-full" style={{ background: "#F7E7CE", color: "#556B2F", fontSize: "0.875rem", fontWeight: 600, padding: "6px 18px" }}>
            Love stories
          </span>
          <h2 className="mt-5" style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.6rem)", color: "#1A2410", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            Moments now cherished forever
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={20} weight="fill" className="text-[#F59E0B]" />
              ))}
            </div>
            <span className="text-[#1A2410]" style={{ fontWeight: 600, fontSize: "0.9rem" }}>4.9 out of 5</span>
            <span className="text-[#9A9A9A]" style={{ fontSize: "0.9rem" }}>from 12,000+ couples</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              style={{ border: "1px solid #F0F0EC" }}
            >
              <span className="inline-flex items-center justify-center rounded-2xl mb-5" style={{ width: 44, height: 44, background: "#F7E7CE" }}>
                <Quotes size={22} weight="fill" className="text-[#556B2F]" />
              </span>

              <span className="inline-flex self-start rounded-full mb-5" style={{ background: "#EEF2E6", color: "#556B2F", padding: "5px 12px", fontSize: "0.78rem", fontWeight: 500 }}>
                {t.highlight}
              </span>

              <p className="text-[#3A3A3A] flex-1 mb-6" style={{ fontStyle: "italic", fontSize: "1.02rem", lineHeight: 1.65 }}>
                &ldquo;{t.review}&rdquo;
              </p>

              <div className="flex items-center gap-0.5 mb-5">
                {[0, 1, 2, 3, 4].map((j) => (
                  <Star key={j} size={16} weight="fill" className="text-[#F59E0B]" />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid #F0F0EC" }}>
                <span className="relative inline-block rounded-full overflow-hidden shrink-0" style={{ width: 48, height: 48, border: "2px solid #F7E7CE" }}>
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="48px" />
                </span>
                <div>
                  <p className="text-[#1A2410]" style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</p>
                  <p className="text-[#556B2F]" style={{ fontSize: "0.78rem" }}>{t.role}</p>
                  <p className="text-[#9A9A9A]" style={{ fontSize: "0.78rem" }}>{t.wedding}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
