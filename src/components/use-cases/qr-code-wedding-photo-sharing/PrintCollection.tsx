"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { DownloadSimple } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const PRINT_ITEMS = [
  { name: "Welcome Sign", icon: "🪧", size: 'A2 / 24×36"', description: "Grand entrance statement piece" },
  { name: "Reception Poster", icon: "🖼️", size: 'A3 / 11×17"', description: "Elegant table-side display" },
  { name: "Table Cards", icon: "🃏", size: '4×6"', description: "Individual guest table setting" },
  { name: "Wedding Menus", icon: "📋", size: '4×9"', description: "Integrated into dinner menu" },
  { name: "Guest Book Sign", icon: "📖", size: 'A4 / 8.5×11"', description: "Alongside traditional guestbook" },
  { name: "Thank You Cards", icon: "💌", size: '4×6"', description: "Post-wedding follow-up" },
  { name: "Photo Booth Sign", icon: "📷", size: 'A3 / 11×17"', description: "At your photo booth station" },
  { name: "Ceremony Sign", icon: "💒", size: 'A2 / 24×36"', description: "Ceremony entrance display" },
];

const BGS = ["#f7e7ce", "#e8f5d8", "#fce8ef", "#e8eef8", "#f5e8fc", "#fef9e8", "#e8f8f5", "#f8e8e8"];

function MiniQr() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      {[[2, 2], [30, 2], [2, 30]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="16" height="16" rx="2" fill="#556B2F" />
          <rect x={x + 3} y={y + 3} width="10" height="10" rx="1" fill="white" />
          <rect x={x + 5} y={y + 5} width="6" height="6" rx="0.5" fill="#556B2F" />
        </g>
      ))}
      {[20, 24, 28, 32, 36, 40].map((x, i) =>
        [20, 24, 28, 32, 36, 40, 44].filter((_, j) => (i + j) % 2 === 0).map((y, j) => (
          <rect key={`${i}-${j}`} x={x} y={y} width="3" height="3" rx="0.5" fill="#556B2F" opacity={0.7} />
        )),
      )}
    </svg>
  );
}

export function PrintCollection() {
  return (
    <section id="qr-packs" style={{ background: "linear-gradient(160deg, #fefef9 0%, #f4f9ee 100%)", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="Wedding QR print collection"
            title={<>Beautifully designed<br />printable materials</>}
            subtitle="Every print design prominently features your personalised QR code, ready to display throughout your venue."
            subtitleMaxWidth={560}
          />
        </div>

        <div className="grid print-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {PRINT_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              className="overflow-hidden"
              style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
              whileHover={{ y: -8, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
            >
              <div className="relative flex items-center justify-center" style={{ background: BGS[i % BGS.length], height: 180, padding: 24 }}>
                <div className="text-center" style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", width: "80%" }}>
                  <div style={{ fontSize: 10, color: "#2d3a1c", marginBottom: 8, letterSpacing: 1 }}>SARAH &amp; JAMES</div>
                  <div className="flex justify-center" style={{ marginBottom: 8 }}><MiniQr /></div>
                  <div style={{ fontSize: 7, color: "#9ca3af" }}>Scan to share your photos</div>
                </div>
                <div className="absolute" style={{ top: 12, right: 12, background: "rgba(85,107,47,0.15)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "#556B2F", fontWeight: 600 }}>{item.size}</div>
              </div>
              <div style={{ padding: "20px 22px" }}>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "#2d3a1c" }}>{item.name}</h3>
                </div>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 }}>{item.description}</p>
                <span className="flex items-center" style={{ gap: 6, fontSize: 13, color: "#556B2F", fontWeight: 600 }}>
                  <DownloadSimple size={13} /> Download Template
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center" style={{ marginTop: 48 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
          <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", color: "#fff", padding: "16px 36px", borderRadius: 50, fontSize: 16, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 24px rgba(85,107,47,0.3)" }}
            >
              <DownloadSimple size={18} /> Browse All Wedding QR Templates
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 1100px) { .print-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 768px) { .print-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .print-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
