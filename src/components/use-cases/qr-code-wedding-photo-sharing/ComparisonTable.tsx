"use client";

import { motion } from "motion/react";
import { Check, X, Minus } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

type CellValue = boolean | "partial";

type ColKey = "momento" | "whatsapp" | "drive" | "email" | "airdrop";
const COLUMNS: { key: ColKey; label: string; sub: string; highlight?: boolean }[] = [
  { key: "momento", label: "Momento", sub: "App", highlight: true },
  { key: "whatsapp", label: "WhatsApp", sub: "" },
  { key: "drive", label: "Google", sub: "Drive" },
  { key: "email", label: "Email", sub: "" },
  { key: "airdrop", label: "AirDrop", sub: "" },
];

const ROWS: { feature: string; momento: CellValue; whatsapp: CellValue; drive: CellValue; email: CellValue; airdrop: CellValue }[] = [
  { feature: "QR Code Upload", momento: true, whatsapp: false, drive: false, email: false, airdrop: false },
  { feature: "No App Download Required", momento: true, whatsapp: false, drive: false, email: true, airdrop: false },
  { feature: "Unlimited Guest Uploads", momento: true, whatsapp: false, drive: "partial", email: false, airdrop: false },
  { feature: "High-Resolution Photos", momento: true, whatsapp: false, drive: true, email: false, airdrop: true },
  { feature: "Video Uploads", momento: true, whatsapp: true, drive: true, email: false, airdrop: true },
  { feature: "Shared Album", momento: true, whatsapp: "partial", drive: true, email: false, airdrop: false },
  { feature: "Real-Time Uploads", momento: true, whatsapp: true, drive: "partial", email: false, airdrop: true },
  { feature: "Cross-Platform Support", momento: true, whatsapp: true, drive: true, email: true, airdrop: false },
  { feature: "Secure Private Album", momento: true, whatsapp: false, drive: "partial", email: true, airdrop: true },
  { feature: "Easy Event Setup", momento: true, whatsapp: "partial", drive: "partial", email: false, airdrop: false },
];

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: highlight ? "rgba(255,255,255,0.92)" : "rgba(85,107,47,0.1)" }}>
        <Check size={14} color="#556B2F" weight="bold" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: "rgba(234,179,8,0.1)" }}>
        <Minus size={14} color="#ca8a04" weight="bold" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: "rgba(239,68,68,0.08)" }}>
      <X size={14} color="#ef4444" weight="bold" />
    </span>
  );
}

const GRID = "1.8fr repeat(5, 1fr)";

export function ComparisonTable() {
  return (
    <section style={{ background: "#fff", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 64 }}>
          <SectionHeader badge="Why Momento App wins" title={<>Compare wedding photo<br />sharing options</>} />
        </div>

        <motion.div
          className="overflow-hidden"
          style={{ borderRadius: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(85,107,47,0.1)" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Header */}
          <div className="grid" style={{ gridTemplateColumns: GRID, background: "#f9faf5", borderBottom: "1px solid rgba(85,107,47,0.08)" }}>
            <div style={{ padding: "20px 24px" }} />
            {COLUMNS.map((col) => (
              <div key={col.key} className="relative text-center" style={{ padding: "20px 12px", background: col.highlight ? "linear-gradient(135deg, #556B2F, #7a9640)" : "transparent" }}>
                {col.highlight && <div className="absolute" style={{ top: -1, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #a3e635, #7a9640)", borderRadius: "2px 2px 0 0" }} />}
                <div style={{ fontSize: 16, fontWeight: 700, color: col.highlight ? "#fff" : "#2d3a1c", lineHeight: 1.2 }}>{col.label}</div>
                {col.sub && <div style={{ fontSize: 11, color: col.highlight ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>{col.sub}</div>}
              </div>
            ))}
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              className="grid"
              style={{ gridTemplateColumns: GRID, borderBottom: i < ROWS.length - 1 ? "1px solid rgba(85,107,47,0.06)" : "none", background: i % 2 === 0 ? "#fff" : "#fafdf7" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center" style={{ padding: "18px 24px", fontSize: 15, color: "#374151", fontWeight: 500 }}>{row.feature}</div>
              {COLUMNS.map((col) => (
                <div key={col.key} className="flex items-center justify-center" style={{ padding: "18px 12px", background: col.highlight ? "rgba(85,107,47,0.03)" : "transparent" }}>
                  <Cell value={row[col.key]} highlight={col.highlight} />
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center flex-wrap" style={{ gap: 28, marginTop: 28 }}>
          {[
            { icon: <Check size={12} color="#556B2F" weight="bold" />, bg: "rgba(85,107,47,0.1)", label: "Fully supported" },
            { icon: <Minus size={12} color="#ca8a04" weight="bold" />, bg: "rgba(234,179,8,0.1)", label: "Partially supported" },
            { icon: <X size={12} color="#ef4444" weight="bold" />, bg: "rgba(239,68,68,0.1)", label: "Not supported" },
          ].map((item) => (
            <div key={item.label} className="flex items-center" style={{ gap: 8 }}>
              <span className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: item.bg }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
