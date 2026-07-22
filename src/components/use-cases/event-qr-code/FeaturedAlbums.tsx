"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Images } from "@phosphor-icons/react";
import { SectionHeading } from "./SectionHeading";

const ALBUMS = [
  { src: "/use-cases/album-annual-conference.jpg", title: "Annual Conference", sub: "Tech Summit 2025", photos: "312 photos" },
  { src: "/use-cases/album-birthday-bash.jpg", title: "Birthday Bash", sub: "Emma's 30th Surprise", photos: "184 photos" },
  { src: "/use-cases/album-graduation-day.jpg", title: "Graduation Day", sub: "Class of 2025", photos: "427 photos" },
  { src: "/use-cases/album-charity-gala.jpg", title: "Charity Gala", sub: "Hope Foundation Annual", photos: "203 photos" },
  { src: "/use-cases/album-family-reunion.jpg", title: "Family Reunion", sub: "Johnson Family 2025", photos: "156 photos" },
  { src: "/use-cases/album-summer-festival.jpg", title: "Summer Festival", sub: "Riverside Music Fest", photos: "589 photos" },
];

export function FeaturedAlbums() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(to bottom, #FAFAF8 0%, #F5F2EC 100%)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Featured events albums"
          title="Real events. Real memories."
          subtitle="Every album below was created with a single QR code and filled by guests in real time."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALBUMS.map((a, i) => (
            <motion.article
              key={a.title}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ border: "1.36px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
            >
              <div className="relative w-full" style={{ aspectRatio: "387/242" }}>
                <Image src={a.src} alt={a.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>

              <div className="p-5">
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "25.5px" }}>{a.title}</h3>
                <p style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#888", lineHeight: "19.5px", marginTop: 2 }}>{a.sub}</p>
                <p className="mt-3 flex items-center gap-1.5" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#556B2F", lineHeight: "19.5px" }}>
                  <Images size={16} />
                  {a.photos}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
