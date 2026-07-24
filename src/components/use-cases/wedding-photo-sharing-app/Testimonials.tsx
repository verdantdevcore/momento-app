"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star, Check } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const REVIEWS = [
  {
    highlight: "800+ photos from guests",
    quote:
      "Momento App was an absolute game-changer for our wedding. We ended up with over 800 photos from our guests — moments we would have never seen otherwise. Setting up the QR code table cards took 10 minutes. Our guests loved how easy it was to use.",
    name: "Emma & James Richardson",
    meta: "Newlyweds · London, UK",
    role: "Wedding Couple",
    avatar: "/use-cases/wedding/avatar-1.jpg",
  },
  {
    highlight: "Recommended to 50+ couples",
    quote:
      "I recommend Momento App to every couple I work with. It's the most seamless guest photo collection tool I've seen. No more asking guests to email photos or join group chats. The QR code does all the work and the gallery is beautiful.",
    name: "Sarah Collins",
    meta: "Wedding Planner · New York, USA",
    role: "Wedding Planner",
    avatar: "/use-cases/wedding/avatar-2.jpg",
  },
  {
    highlight: "Used at 30+ weddings",
    quote:
      "As an event planner, I was skeptical at first — but Momento App has become an essential part of my wedding packages. Guest photos complement my professional shots perfectly. The high-res uploads and easy download make the final delivery so much richer.",
    name: "Marcus Webb",
    meta: "Professional Photographer · Sydney, Australia",
    role: "Event Planner",
    avatar: "/use-cases/wedding/avatar-3.jpg",
  },
];

function Stars({ size }: { size: number }) {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((s) => (
        <Star key={s} size={size} weight="fill" color="#E8B33A" />
      ))}
    </span>
  );
}

export function Testimonials() {
  return (
    <section className="py-28" style={{ background: "#FDFAF6" }}>
      <div className="site-container">
        <SectionHeading
          badge="Love stories"
          title={
            <>
              Couples love <span style={{ color: "#556B2F" }}>Momento App</span>
            </>
          }
          subtitle="Join thousands of couples who've used Momento App to capture every perspective of their special day."
        />

        <motion.div
          className="mt-6 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Stars size={17} />
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "24px" }}>4.9/5</span>
          <span style={{ fontSize: "0.9375rem", color: "#6B6B6B", lineHeight: "24px" }}>from 2,400+ reviews</span>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              className="flex flex-col bg-white"
              style={{ borderRadius: 20, border: "1.36px solid #EFE7DB", padding: 28 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              <span aria-hidden style={{ fontSize: "2.5rem", color: "#F0E2C6", lineHeight: 0.8, fontFamily: "Georgia, serif" }}>
                &rdquo;
              </span>

              <span className="mt-4">
                <Stars size={13} />
              </span>

              {/* All three highlight pills are champagne (Figma 2:4229/2:4293):
                  #F7E7CE fill, #E8D4AE border, #556B2F text. */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full self-start mt-4"
                style={{ background: "#F7E7CE", border: "1.36px solid #E8D4AE", color: "#556B2F", fontSize: "0.75rem", fontWeight: 600, lineHeight: "16px", padding: "6px 12px" }}
              >
                <Check size={12} weight="bold" />
                {r.highlight}
              </span>

              <blockquote
                className="mt-4 flex-1"
                style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#5A5A5A", lineHeight: "24.5px" }}
              >
                &ldquo;{r.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 pt-5 flex items-center gap-3" style={{ borderTop: "1.36px solid #EFE7DB" }}>
                <span className="relative rounded-full overflow-hidden shrink-0" style={{ width: 44, height: 44 }}>
                  <Image src={r.avatar} alt="" fill className="object-cover" sizes="44px" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block" style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "20px" }}>
                    {r.name}
                  </span>
                  <span className="block" style={{ fontSize: "0.8125rem", color: "#8A8A8A", lineHeight: "18px" }}>
                    {r.meta}
                  </span>
                </span>
                {/* All three role tags are sage (Figma 2:4244/2:4308):
                    #E8F0D8 @ 50%, #556B2F text. */}
                <span
                  className="shrink-0 rounded-full"
                  style={{ background: "rgba(232,240,216,0.5)", color: "#556B2F", fontSize: "0.6875rem", fontWeight: 500, lineHeight: "16px", padding: "6px 10px" }}
                >
                  {r.role}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
