"use client";

import { motion } from "motion/react";
import { MapPin } from "@phosphor-icons/react";
import { SectionHeader, Accent } from "./SectionHeader";

const PLACEMENTS = [
  { location: "Entrance Welcome Sign", icon: "🚪", tip: "First touchpoint — maximises early upload momentum before the ceremony begins.", timing: "Before ceremony" },
  { location: "Reception Entrance", icon: "🏛️", tip: "Guests scan as they arrive, setting expectations for the entire photo-sharing experience.", timing: "Arrival" },
  { location: "Dining Tables", icon: "🍽️", tip: "Table cards keep the QR visible during dinner when guests are most relaxed and likely to upload.", timing: "During dinner" },
  { location: "Wedding Programs", icon: "📜", tip: "Every guest holds a program, making it the highest-exposure placement at the ceremony.", timing: "During ceremony" },
  { location: "Wedding Menus", icon: "🥂", tip: "Integrates organically into the dining experience without feeling like an imposition.", timing: "During dinner" },
  { location: "Bar Counter", icon: "🍾", tip: "Guests wait at the bar — ideal moment to scan while their hands are free.", timing: "All evening" },
  { location: "Guest Book Table", icon: "📖", tip: "Pair physical and digital memories: sign the guestbook and scan to upload a photo.", timing: "Reception" },
  { location: "Dance Floor Entrance", icon: "💃", tip: "High energy moment — guests are already on their phones capturing memories.", timing: "Evening" },
  { location: "Photo Booth", icon: "📷", tip: "100% of photo booth guests have their phones out — capture maximum uploads instantly.", timing: "Throughout" },
];

export function PlacementGuide() {
  return (
    <section style={{ background: "#fff", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            badge="QR placement guide"
            title={<>Place your QR code<br /><Accent>everywhere it matters</Accent></>}
            subtitle="The more QR codes you display, the more memories you collect. Here's where to place them for maximum guest participation."
          />
        </div>

        <div className="grid placement-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {PLACEMENTS.map((place, i) => (
            <motion.div
              key={place.location}
              style={{ background: "linear-gradient(135deg, #fafdf7, #f7fbf2)", borderRadius: 20, padding: "28px 26px", border: "1px solid rgba(85,107,47,0.1)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start" style={{ gap: 14 }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: 52, height: 52, borderRadius: 16, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 24 }}>{place.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "#2d3a1c", lineHeight: 1.3, marginBottom: 6 }}>{place.location}</h3>
                  <div className="inline-flex items-center" style={{ gap: 4, background: "rgba(85,107,47,0.1)", borderRadius: 20, padding: "2px 10px", marginBottom: 10 }}>
                    <MapPin size={10} color="#556B2F" />
                    <span style={{ fontSize: 11, color: "#556B2F", fontWeight: 600 }}>{place.timing}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{place.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center flex-wrap"
          style={{ marginTop: 48, background: "linear-gradient(135deg, #556B2F 0%, #7a9640 100%)", borderRadius: 24, padding: "36px 48px", gap: 24 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div style={{ fontSize: 40 }}>💡</div>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Pro Tip: Display at Least 5 QR Signs</h3>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 620 }}>
              Couples who display 5+ QR signs collect an average of 340% more photos than those with a single sign. Our
              Print Collection includes unlimited downloads for every template.
            </p>
          </div>
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 900px) { .placement-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 540px) { .placement-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
