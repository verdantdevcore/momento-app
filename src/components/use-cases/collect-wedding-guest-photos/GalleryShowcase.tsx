"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { MagnifyingGlass, Heart, DownloadSimple, SquaresFour, List, Clock, DotsThree } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const tabs = ["Timeline", "Album", "Favorites"];

const photos = [
  { id: 1, src: `${BASE}/gallery-ceremony.jpg`, alt: "Ceremony" },
  { id: 2, src: `${BASE}/gallery-bouquet.jpg`, alt: "Bouquet" },
  { id: 3, src: `${BASE}/gallery-first-dance.jpg`, alt: "First Dance" },
  { id: 4, src: `${BASE}/gallery-dancing.jpg`, alt: "Dancing" },
  { id: 5, src: `${BASE}/gallery-groom.jpg`, alt: "Groom" },
  { id: 6, src: `${BASE}/gallery-bride.jpg`, alt: "Bride" },
];

const albumStats = [
  { label: "Photos", value: "847" },
  { label: "Videos", value: "63" },
  { label: "Contributors", value: "142" },
  { label: "Favorites", value: "218" },
];

export function GalleryShowcase() {
  const [activeTab, setActiveTab] = useState("Album");
  const [liked, setLiked] = useState<Set<number>>(new Set([1, 3, 5]));

  const toggle = (id: number) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #EEF2E6 100%)" }}>
      <div className="site-container">
        <SectionHeader
          badge="Your album"
          title="A Wedding album as beautiful as your day"
          subtitle="All guest photos and videos — organized, searchable, and always stunning."
        />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-4xl shadow-2xl overflow-hidden" style={{ border: "1px solid #F0F0EC" }}>
            {/* App header */}
            <div className="bg-white px-6 py-4" style={{ borderBottom: "1px solid #F0F0EC" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[#1A2410]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Sophia &amp; James&rsquo;s Wedding Album</h3>
                  <p className="text-[#9A9A9A] flex items-center gap-1" style={{ fontSize: "0.75rem" }}>
                    <Clock size={13} /> July 14, 2026 · Tuscany, Italy
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full" style={{ background: "#F7E7CE", padding: "6px 12px" }}>
                    <span className="rounded-full" style={{ width: 8, height: 8, background: "#556B2F" }} />
                    <span className="text-[#2C3A1E]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>847 photos</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Download album">
                    <DownloadSimple size={15} className="text-[#556B2F]" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-label="More options">
                    <DotsThree size={16} className="text-gray-500" weight="bold" />
                  </button>
                </div>
              </div>

              <div className="relative mb-4">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  readOnly
                  className="w-full rounded-xl bg-gray-50 text-gray-600 outline-none"
                  style={{ padding: "10px 16px 10px 38px", fontSize: "0.875rem", border: "1px solid #EAEAEA" }}
                />
              </div>

              <div className="flex gap-1 items-center">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full transition-all"
                    style={{
                      padding: "6px 16px",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      background: activeTab === tab ? "#556B2F" : "transparent",
                      color: activeTab === tab ? "#fff" : "#6B7280",
                    }}
                  >
                    {tab}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#556B2F]" aria-label="Grid view"><SquaresFour size={16} /></button>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400" aria-label="List view"><List size={16} /></button>
                </div>
              </div>
            </div>

            {/* Photo grid */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-[#556B2F]" />
                <span className="text-[#556B2F] uppercase" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em" }}>Today&rsquo;s Memories</span>
                <span className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
                    <Image src={photo.src} alt={photo.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 33vw, 260px" />
                    <button onClick={() => toggle(photo.id)} className="absolute top-1.5 right-1.5" aria-label="Favorite photo">
                      <Heart
                        size={16}
                        weight={liked.has(photo.id) ? "fill" : "regular"}
                        className={liked.has(photo.id) ? "text-red-400 drop-shadow" : "text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity"}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="rounded-full text-[#556B2F] hover:bg-[#556B2F]/5 transition-colors" style={{ padding: "8px 20px", fontSize: "0.875rem", fontWeight: 500, border: "1px solid rgba(85,107,47,0.2)" }}>
                  View all 847 photos
                </button>
              </div>
            </div>

            {/* Album stats */}
            <div className="px-6 py-4" style={{ borderTop: "1px solid #F0F0EC", background: "#F8FAF5" }}>
              <div className="grid grid-cols-4 gap-4 text-center">
                {albumStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[#556B2F]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{stat.value}</div>
                    <div className="text-[#9A9A9A]" style={{ fontSize: "0.75rem" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
