"use client";

import { motion } from "motion/react";
import { X, Check } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const PAINS = [
  "WhatsApp groups — photos buried in chats",
  "AirDrop — only works for Apple users",
  "Email requests — low response rate",
  "USB transfers — too slow and impractical",
  "Social media downloads — compressed quality",
];

const SOLUTIONS = [
  "Scan the QR code — any phone, instant access",
  "Upload photos & videos — no compression",
  "Done — couple receives memories instantly",
];

export function WhyQRCodes() {
  return (
    <section id="how-it-works" style={{ background: "linear-gradient(160deg, #f9fdf5 0%, #fefef9 100%)", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            badge="Why QR codes"
            title={<>The simplest way to collect<br />every guest photo</>}
            subtitle="Traditional photo-sharing methods create friction, miss memories, and frustrate guests. QR codes eliminate every barrier in one elegant scan."
            subtitleMaxWidth={560}
          />
        </div>

        <div className="grid items-start why-grid" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 40 }}>
          {/* Problems */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", border: "1px solid rgba(239,68,68,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 28 }}>
                <span className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "rgba(239,68,68,0.1)" }}>
                  <X size={18} color="#ef4444" weight="bold" />
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#2d3a1c" }}>The Old Way</h3>
              </div>
              <div className="flex flex-col" style={{ gap: 14 }}>
                {PAINS.map((pain, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start"
                    style={{ gap: 12, padding: "12px 16px", background: "rgba(254,242,242,0.7)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.08)" }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 20, height: 20, background: "rgba(239,68,68,0.15)", marginTop: 1 }}>
                      <X size={11} color="#ef4444" weight="bold" />
                    </span>
                    <span style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.5 }}>{pain}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* VS */}
          <motion.div
            className="flex flex-col items-center justify-center"
            style={{ paddingTop: 80 }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="flex items-center justify-center rounded-full" style={{ width: 48, height: 48, background: "linear-gradient(135deg, #556B2F, #7a9640)", color: "#fff", fontSize: 14, boxShadow: "0 4px 16px rgba(85,107,47,0.3)" }}>VS</span>
          </motion.div>

          {/* Solutions */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f4f9ee, #e8f5d8)", borderRadius: 24, padding: "36px 32px", border: "1px solid rgba(85,107,47,0.15)", boxShadow: "0 4px 24px rgba(85,107,47,0.08)" }}>
              <div className="absolute rounded-full" style={{ top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(85,107,47,0.1) 0%, transparent 70%)" }} />
              <div className="flex items-center" style={{ gap: 10, marginBottom: 28 }}>
                <span className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "rgba(85,107,47,0.15)" }}>
                  <Check size={18} color="#556B2F" weight="bold" />
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#2d3a1c" }}>The Momento App Way</h3>
              </div>
              <div className="flex flex-col" style={{ gap: 14, marginBottom: 28 }}>
                {SOLUTIONS.map((sol, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start"
                    style={{ gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.7)", borderRadius: 12, border: "1px solid rgba(85,107,47,0.12)" }}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 22, height: 22, background: "#556B2F", marginTop: 1 }}>
                      <Check size={12} color="#fff" weight="bold" />
                    </span>
                    <span style={{ fontSize: 15, color: "#374151", lineHeight: 1.5, fontWeight: 500 }}>{sol}</span>
                  </motion.div>
                ))}
              </div>
              <div className="text-center" style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ fontSize: 28, color: "#fff", marginBottom: 4 }}>3 Simple Steps</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Scan → Upload → Done</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .why-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
