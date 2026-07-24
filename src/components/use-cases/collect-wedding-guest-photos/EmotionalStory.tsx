"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const photos = [
  { src: `${BASE}/story-parents.jpg`, alt: "Parents watching proudly as their child begins a new chapter" },
  { src: `${BASE}/story-friends-laughing.jpg`, alt: "Friends laughing during heartfelt speeches" },
  { src: `${BASE}/story-children-dancing.jpg`, alt: "Children dancing freely on the reception floor" },
  { src: `${BASE}/story-bridesmaids.jpg`, alt: "Bridesmaids sharing tender moments before the ceremony" },
  { src: `${BASE}/story-grandparents.jpg`, alt: "Grandparents smiling, witnessing love across generations" },
  { src: `${BASE}/story-guests-capturing.jpg`, alt: "Guests capturing spontaneous moments only they could see" },
];

export function EmotionalStory() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Multiple perspectives"
          title="Hundreds of eyes. One wedding day."
          subtitle="Every guest witnessed something unique — a proud parent's glance, a grandparent's smile, children spinning on the dance floor. Each perspective is irreplaceable."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-500"
            >
              <div className="relative aspect-4/5 overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 text-center max-w-2xl mx-auto"
        >
          <blockquote style={{ color: "#556B2F", fontStyle: "italic", fontWeight: 600, fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", lineHeight: 1.4 }}>
            &ldquo;Every guest holds a piece of your story that only they could see.&rdquo;
          </blockquote>
          <p className="text-[#9A9A9A] mt-3" style={{ fontSize: "0.9rem" }}>— The Momento App Promise</p>
        </motion.div>
      </div>
    </section>
  );
}
