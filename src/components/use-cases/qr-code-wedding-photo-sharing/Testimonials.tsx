"use client";

import { motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { SectionHeader, Accent } from "./SectionHeader";

const REVIEWS = [
  { name: "Sophie Hartwell", role: "Bride", avatar: "/use-cases/wedding/avatar-1.jpg", review: "We had 180 guests and collected over 1,200 photos without asking anyone for anything. The QR signs on each table meant everyone just naturally scanned and uploaded. Absolute game-changer for our wedding memories.", details: "Married June 2025 · Cotswolds, UK" },
  { name: "Marcus Webb", role: "Groom", avatar: "/use-cases/wedding/avatar-2.jpg", review: "I was sceptical at first — thought guests wouldn't bother. By the end of the night we had 847 photos from 120 guests. Momento App made it so effortless that even our oldest guests were scanning and uploading.", details: "Married April 2025 · Tuscany, Italy" },
  { name: "Chloe Beaumont", role: "Wedding Photographer", avatar: "/use-cases/wedding/avatar-3.jpg", review: "I recommend Momento App to every client now. The guest candids that come through are genuinely priceless — angles and moments I simply can't capture on my own. It perfectly complements professional photography.", details: "5 years photographing weddings" },
  { name: "Isabella Monroe", role: "Wedding Planner", avatar: "/use-cases/wedding/avatar-4.jpg", review: "I include Momento App in every wedding package I offer now. Setup takes minutes, the QR templates are stunning, and couples are always blown away. It's the single feature that gets the most positive feedback from guests.", details: "Planning weddings since 2018" },
];

const STATS = [
  { value: "4.9/5", label: "Average rating" },
  { value: "25,000+", label: "Happy couples" },
  { value: "2M+", label: "Photos shared" },
  { value: "98%", label: "Would recommend" },
];

export function Testimonials() {
  return (
    <section style={{ background: "linear-gradient(160deg, #fefef9 0%, #f7f3ec 100%)", padding: "100px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            badge="Love stories"
            title={<>Why couples love <Accent>Momento App</Accent></>}
            subtitle="Trusted by couples, photographers, and planners across 150+ countries."
          />
        </div>

        <div className="grid testimonials-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {REVIEWS.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative overflow-hidden"
              style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", border: "1px solid rgba(85,107,47,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute" style={{ top: 20, right: 24, fontSize: 80, color: "rgba(85,107,47,0.06)", lineHeight: 1, userSelect: "none" }} aria-hidden>&ldquo;</div>

              <div className="flex" style={{ gap: 4, marginBottom: 20 }}>
                {[0, 1, 2, 3, 4].map((s) => <Star key={s} size={16} weight="fill" color="#f59e0b" />)}
              </div>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.75, marginBottom: 28 }}>&ldquo;{t.review}&rdquo;</p>

              <div className="flex items-center" style={{ gap: 14 }}>
                <span className="shrink-0 rounded-full" style={{ width: 48, height: 48, border: "2px solid rgba(85,107,47,0.15)", backgroundImage: `url(${t.avatar})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2d3a1c", marginBottom: 2 }}>{t.name}</div>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#556B2F", fontWeight: 600 }}>{t.role}</span>
                    <span style={{ color: "#d1d5db", fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{t.details}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-center flex-wrap"
          style={{ marginTop: 48, background: "#fff", borderRadius: 20, padding: "24px 40px", gap: 48, border: "1px solid rgba(85,107,47,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{ fontSize: 28, fontWeight: 700, color: "#556B2F", marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#9ca3af" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
