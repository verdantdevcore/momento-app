"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Microphone, Briefcase, Users, Globe, GraduationCap, Heart, Trophy, Church, MusicNotes, Baby, Chalkboard } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const GREEN = { color: "#556B2F", bg: "#eef2e8" };
const GOLD = { color: "#7a5c00", bg: "#fef9ed" };
const ROSE = { color: "#9b2335", bg: "#fdf0f2" };

const EVENT_TYPES = [
  { Icon: Microphone, title: "Conferences", desc: "Capture every keynote, breakout session, and networking moment from attendees across the room.", ...GREEN, image: "/use-cases/event/conference-stage.jpg" },
  { Icon: Briefcase, title: "Corporate Events", desc: "Company retreats, team-building days, and product launches — documented from every angle.", ...GREEN, image: "/use-cases/event/corporate.jpg" },
  { Icon: Users, title: "Networking Events", desc: "Let attendees share candid moments from mixers, meetups, and professional gatherings instantly.", ...GOLD, image: "/use-cases/event/networking.jpg" },
  { Icon: Globe, title: "Trade Shows", desc: "Collect booth photos, product demos, and floor coverage from exhibitors and visitors alike.", ...GOLD, image: "/use-cases/event/trade-show.jpg" },
  { Icon: GraduationCap, title: "Graduations", desc: "Unite families and friends in one album — from ceremonies to celebrations.", ...GREEN, image: "/use-cases/event/graduation.jpg" },
  { Icon: Heart, title: "Family Reunions", desc: "Bring relatives together in a shared photo stream that everyone can contribute to and keep.", ...ROSE, image: "/use-cases/event/reunion.jpg" },
  { Icon: Trophy, title: "Charity Events", desc: "Capture fundraiser highlights and donor moments to use in future campaigns and reports.", ...GOLD, image: "/use-cases/event/charity-gala.jpg" },
  { Icon: Church, title: "Church Programs", desc: "Let your congregation share worship, outreach, and ministry events in one beautiful album.", ...GREEN, image: "/use-cases/event/church-programs.jpg" },
  { Icon: MusicNotes, title: "Festivals", desc: "Crowd-sourced coverage of performances, art installations, and festival atmosphere.", ...ROSE, image: "/use-cases/event/festival.jpg" },
  { Icon: Trophy, title: "Award Ceremonies", desc: "Preserve every award, acceptance speech, and celebration photo in a curated event album.", ...GOLD, image: "/use-cases/event/award-ceremonies.jpg" },
  { Icon: Baby, title: "Baby Showers", desc: "Let guests upload their candid shots so mom gets every sweet moment from the celebration.", ...ROSE, image: "/use-cases/event/baby-showers.jpg" },
  { Icon: Chalkboard, title: "School Events", desc: "Sports days, performances, science fairs — every parent and teacher can contribute.", ...GREEN, image: "/use-cases/event/school-events.jpg" },
];

export function EventTypes() {
  return (
    <section id="event-types" style={{ background: "#fafaf8", padding: "96px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="Event photo sharing"
            title="Perfect for every kind of event"
            subtitle="Whether you're organizing a small gathering or a large-scale conference, Momento App adapts to every event type and scale."
          />
        </div>

        <div className="grid event-types-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {EVENT_TYPES.map((t, i) => (
            <motion.div
              key={t.title}
              className="overflow-hidden"
              style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            >
              {t.image && (
                <div className="relative" style={{ height: 140 }}>
                  <Image src={t.image} alt={`${t.title} event photo sharing`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 300px" />
                </div>
              )}
              <div style={{ padding: 20 }}>
                <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, color: t.color, marginBottom: 12 }}>
                  <t.Icon size={22} weight="regular" />
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 8 }}>{t.title}</h3>
                <p style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .event-types-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .event-types-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .event-types-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
