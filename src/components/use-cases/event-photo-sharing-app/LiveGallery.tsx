"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { GridFour, Clock, Heart, DownloadSimple, MagnifyingGlass, FunnelSimple, Star } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const TILES = [
  { src: "/use-cases/event/conference-audience.jpg", h: 260, label: "Conference", time: "2m ago" },
  { src: "/use-cases/event/conference-stage.jpg", h: 200, label: "Keynote", time: "5m ago" },
  { src: "/use-cases/event/festival.jpg", h: 300, label: "Festival", time: "8m ago" },
  { src: "/use-cases/event/graduation.jpg", h: 240, label: "Graduation", time: "12m ago" },
  { src: "/use-cases/event/networking.jpg", h: 200, label: "Networking", time: "15m ago" },
  { src: "/use-cases/event/trade-show.jpg", h: 260, label: "Trade Show", time: "20m ago" },
  { src: "/use-cases/event/charity-gala.jpg", h: 220, label: "Gala", time: "25m ago" },
  { src: "/use-cases/event/corporate.jpg", h: 280, label: "Corporate", time: "30m ago" },
];

const VIEWS = [
  { name: "Masonry", Icon: GridFour },
  { name: "Timeline", Icon: Clock },
  { name: "Albums", Icon: Star },
];
const FILTERS = ["All", "Favorites", "Videos", "Recent"];

export function LiveGallery() {
  const [view, setView] = useState("Masonry");
  const [filter, setFilter] = useState("All");
  const [liked, setLiked] = useState<Record<number, boolean>>({ 0: true, 2: true, 4: true, 6: true });

  return (
    <section id="live-gallery" style={{ background: "#0f1117", padding: "96px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 56 }}>
          <SectionHeader
            badge="Live album experience"
            title="Watch memories appear in real time"
            subtitle="Your event album updates live as guests upload. Beautiful, organized, and instantly shareable."
            dark
          />
        </div>

        <motion.div
          className="overflow-hidden"
          style={{ background: "#1a1d27", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap" style={{ background: "#13151f", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", gap: 12 }}>
            <div className="flex items-center" style={{ gap: 20 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>LIVE</span>
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Annual Tech Conference 2026 &middot; 248 guests &middot; 1,204 photos</span>
            </div>
            <div className="flex" style={{ gap: 8 }}>
              <span className="flex items-center" style={{ gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                <MagnifyingGlass size={14} /> Search
              </span>
              <span className="flex items-center" style={{ gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                <FunnelSimple size={14} /> Filter
              </span>
              <span className="flex items-center" style={{ gap: 6, padding: "7px 14px", borderRadius: 8, background: "#556B2F", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                <DownloadSimple size={14} /> Download All
              </span>
            </div>
          </div>

          {/* View toggle + filters */}
          <div className="flex items-center justify-between flex-wrap" style={{ padding: "14px 24px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex" style={{ gap: 4 }}>
              {VIEWS.map((v) => {
                const on = view === v.name;
                return (
                  <button key={v.name} onClick={() => setView(v.name)} className="flex items-center" style={{ gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: on ? "rgba(139,168,74,0.2)" : "transparent", color: on ? "#8BA84A" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: on ? 600 : 400, cursor: "pointer" }}>
                    <v.Icon size={13} /> {v.name}
                  </button>
                );
              })}
            </div>
            <div className="flex" style={{ gap: 4 }}>
              {FILTERS.map((f) => {
                const on = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 100, border: on ? "1px solid #8BA84A" : "1px solid rgba(255,255,255,0.1)", background: on ? "rgba(139,168,74,0.15)" : "transparent", color: on ? "#8BA84A" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Masonry */}
          <div className="grid album-masonry" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "20px 24px 24px" }}>
            {TILES.map((t, i) => (
              <motion.div
                key={t.label}
                className="relative overflow-hidden"
                style={{ borderRadius: 12, height: t.h }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.05 * i + 0.3, duration: 0.4 }}
              >
                <Image src={t.src} alt={`${t.label} event photo in shared album`} fill className="object-cover" sizes="(max-width: 900px) 50vw, 300px" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                <div className="absolute flex items-center justify-between" style={{ bottom: 8, left: 10, right: 10 }}>
                  <div>
                    <span className="block" style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{t.label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{t.time}</span>
                  </div>
                  <button onClick={() => setLiked((p) => ({ ...p, [i]: !p[i] }))} className="flex items-center" style={{ background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>
                    <Heart size={14} weight={liked[i] ? "fill" : "regular"} color={liked[i] ? "#ef4444" : "#fff"} />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute" style={{ top: 8, left: 8, background: "#22c55e", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>NEW</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) { .album-masonry { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}
