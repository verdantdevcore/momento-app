"use client";

import { motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const REVIEWS = [
  { name: "Sarah Mitchell", role: "Conference Director", org: "TechSummit Global", avatar: "SM", color: "#556B2F", quote: "Momento App completely transformed how we handle photography at our annual conference. With 1,200 attendees, we collected over 4,000 photos without hiring a single extra photographer. The QR code system is genius." },
  { name: "James Okonkwo", role: "Senior Event Planner", org: "Prestige Events Group", avatar: "JO", color: "#7a6200", quote: "I've used every photo collection tool out there — Google Forms, WhatsApp groups, Dropbox links. Nothing comes close to Momento App. Our clients are blown away when they see the album filling up in real time during the event." },
  { name: "Dr. Rachel Chen", role: "Marketing Manager", org: "Nexus Pharmaceuticals", avatar: "RC", color: "#2563eb", quote: "We used Momento App at our corporate symposium and the results were extraordinary. 89% of attendees uploaded photos. We used that content in our annual report and LinkedIn campaign — saving thousands on stock photography." },
  { name: "Amanda Torres", role: "Alumni Events Coordinator", org: "Westfield University", avatar: "AT", color: "#9b2335", quote: "Graduation is one of the most photographed events on campus, but photos were always scattered. Momento App gave us one beautiful album that families still share a year later. The university adopted it as our official photo platform." },
  { name: "Marcus Reid", role: "Executive Director", org: "Hope Foundation", avatar: "MR", color: "#556B2F", quote: "Our annual gala is our biggest fundraiser of the year. Momento App's album became a centerpiece of the event — donors loved seeing themselves and their fellow supporters. We used the photos in our year-end donor impact report." },
];

function Stars({ size }: { size: number }) {
  return (
    <span className="flex" style={{ gap: 2 }}>
      {[0, 1, 2, 3, 4].map((s) => (
        <Star key={s} size={size} weight="fill" color="#F59E0B" />
      ))}
    </span>
  );
}

export function Testimonials() {
  const featured = REVIEWS[0];

  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div className="site-container">
        <SectionHeader badge="Trusted by event professionals" title="What event organizers say" />

        <motion.div
          className="flex flex-col items-center"
          style={{ marginTop: 16, marginBottom: 48 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span style={{ marginBottom: 8 }}><Stars size={20} /></span>
          <p style={{ fontSize: 15, color: "#888" }}>4.9 out of 5 &middot; 2,400+ reviews</p>
        </motion.div>

        {/* Featured */}
        <motion.div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f6faf0, #eef2e8)", border: "1px solid #c8d8b0", borderRadius: 24, padding: "40px 48px", marginBottom: 32 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="absolute rounded-full" style={{ top: -40, right: -40, width: 200, height: 200, background: "rgba(85,107,47,0.05)" }} />
          <div style={{ fontSize: 64, color: "#c8d8b0", lineHeight: 1, marginBottom: 16, fontFamily: "Georgia, serif" }}>&ldquo;</div>
          <p style={{ fontSize: 20, lineHeight: 1.75, color: "#2a2a2a", marginBottom: 28, maxWidth: 800 }}>{featured.quote}</p>
          <div className="flex items-center" style={{ gap: 16 }}>
            <span className="flex items-center justify-center shrink-0 rounded-full" style={{ width: 52, height: 52, background: featured.color, color: "#fff", fontSize: 16, fontWeight: 700 }}>{featured.avatar}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>{featured.name}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{featured.role} &middot; {featured.org}</p>
            </div>
            <span className="ml-auto"><Stars size={16} /></span>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid testimonials-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {REVIEWS.slice(1).map((t, i) => (
            <motion.div
              key={t.name}
              style={{ background: "#fafaf8", border: "1px solid #eee", borderRadius: 20, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <span className="inline-block" style={{ marginBottom: 16 }}><Stars size={14} /></span>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#3a3a3a", marginBottom: 20 }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center" style={{ gap: 12 }}>
                <span className="flex items-center justify-center shrink-0 rounded-full" style={{ width: 42, height: 42, background: t.color, color: "#fff", fontSize: 13, fontWeight: 700 }}>{t.avatar}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{t.role} &middot; {t.org}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
