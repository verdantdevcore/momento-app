"use client";

import { motion } from "motion/react";
import { DoorOpen, MapPin, Tag, Monitor, BookOpen, SquaresFour, Coffee, Camera } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const PLACEMENTS = [
  { Icon: DoorOpen, title: "Registration Desk", desc: "First touchpoint — introduce guests to the album the moment they arrive.", tip: "High visibility, maximum early adoption" },
  { Icon: MapPin, title: "Venue Entrance", desc: "Welcome guests with a prominent QR code display at every entry point.", tip: "Great for outdoor signage" },
  { Icon: Tag, title: "Name Badges", desc: "Print the QR code on lanyards so every guest always has access.", tip: "100% reach guaranteed" },
  { Icon: Monitor, title: "Presentation Screens", desc: "Display between slides and during breaks on the main conference screens.", tip: "Captive audience moments" },
  { Icon: BookOpen, title: "Event Programs", desc: "Include a QR code in printed programs or event brochures for easy reference.", tip: "Physical takeaway reminder" },
  { Icon: SquaresFour, title: "Booth Displays", desc: "Each exhibitor booth can display a QR code to collect demonstration photos.", tip: "Per-booth albums possible" },
  { Icon: Coffee, title: "Networking Tables", desc: "Place QR table tents at dining and networking tables for natural engagement.", tip: "Captures candid moments" },
  { Icon: Camera, title: "Photo Booth", desc: "Integrate with a branded photo booth so guests upload instantly after their shot.", tip: "Highest engagement rate" },
  { Icon: DoorOpen, title: "Exit Area", desc: "Final reminder as guests leave — capture those last-minute farewell photos.", tip: "Capture post-event moments" },
];

// Deterministic QR-like fill so server and client render identically (no hydration mismatch).
function qrOn(i: number) {
  const row = Math.floor(i / 10);
  const col = i % 10;
  const isCorner = (row < 3 && col < 3) || (row < 3 && col >= 7) || (row >= 7 && col < 3);
  if (isCorner) return true;
  const r = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return r - Math.floor(r) > 0.45;
}

export function QrPlacementGuide() {
  return (
    <section style={{ background: "#f8f5f0", padding: "96px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="QR code strategy"
            title="Where to place your QR codes"
            subtitle="More placements mean more uploads. Here's how to maximize participation at every event."
          />
        </div>

        <div className="grid qr-layout" style={{ gridTemplateColumns: "300px 1fr", gap: "4rem", alignItems: "start" }}>
          {/* QR mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="text-center" style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 16px 48px rgba(0,0,0,0.1)", border: "1px solid #eee" }}>
              <div className="relative grid mx-auto" style={{ width: 180, height: 180, marginBottom: 20, borderRadius: 12, background: "#1a1a1a", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, padding: 12 }}>
                {Array.from({ length: 100 }).map((_, i) => (
                  <span key={i} style={{ width: "100%", paddingBottom: "100%", background: qrOn(i) ? "#fff" : "transparent", borderRadius: 1 }} />
                ))}
                <span className="absolute flex items-center justify-center" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 36, height: 36, borderRadius: 8, background: "#556B2F", color: "#fff", fontSize: 16, fontWeight: 700 }}>M</span>
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>Annual Tech Conference</p>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Scan to upload your photos</p>
              <div style={{ background: "#eef2e8", borderRadius: 10, padding: "10px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#556B2F", margin: 0 }}>momento.app/e/atc2026</p>
              </div>
            </div>

            <div style={{ marginTop: 20, background: "#556B2F", borderRadius: 14, padding: 20, color: "#fff" }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Pro Tip</p>
              <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, margin: 0 }}>
                Use at least 5 QR code placements to achieve 80%+ guest participation rates at large events.
              </p>
            </div>
          </motion.div>

          {/* Placement grid */}
          <div className="grid placement-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {PLACEMENTS.map((p, i) => (
              <motion.div
                key={p.title}
                style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #eee", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.06 * i + 0.2, duration: 0.4 }}
              >
                <span className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2e8", color: "#556B2F", marginBottom: 12 }}>
                  <p.Icon size={20} weight="regular" />
                </span>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", marginBottom: 6 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</p>
                <span className="inline-block" style={{ fontSize: 11, fontWeight: 600, color: "#556B2F", background: "#eef2e8", padding: "3px 8px", borderRadius: 6 }}>{p.tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .placement-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 768px) { .qr-layout { grid-template-columns: 1fr !important; gap: 2rem !important; } }
        @media (max-width: 480px) { .placement-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
