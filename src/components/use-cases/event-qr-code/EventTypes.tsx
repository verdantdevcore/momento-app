"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeading } from "../shared/SectionHeading";

const EVENT_TYPES = [
  { src: "/use-cases/conferences.jpg", title: "Conferences", body: "Capture every keynote, workshop, and networking moment." },
  { src: "/use-cases/corporate-events.jpg", title: "Corporate Events", body: "From team offsites to award ceremonies, collect it all." },
  { src: "/use-cases/birthdays.jpg", title: "Birthdays", body: "Let every guest contribute to a shared birthday album." },
  { src: "/use-cases/festivals.jpg", title: "Festivals", body: "Cover every stage and crowd moment across your festival." },
  { src: "/use-cases/graduations.jpg", title: "Graduations", body: "Preserve every graduate's proudest moment in one album." },
  { src: "/use-cases/family-celebrations.jpg", title: "Family Celebrations", body: "Reunions, anniversaries, baby showers — all in one place." },
];

export function EventTypes() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Event types"
          title="Built for every kind of event"
          subtitle="Whatever the occasion, Momento's App QR photo upload works beautifully."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENT_TYPES.map((e, i) => (
            <motion.div
              key={e.title}
              className="relative rounded-3xl overflow-hidden"
              style={{ aspectRatio: "389/292" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
            >
              <Image src={e.src} alt={e.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: "30px" }}>{e.title}</h3>
                <p className="mt-1" style={{ fontSize: "0.875rem", fontWeight: 400, color: "rgba(255,255,255,0.8)", lineHeight: "21px" }}>
                  {e.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
