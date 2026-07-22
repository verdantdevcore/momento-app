"use client";

import { motion } from "motion/react";
import { Check, X, Minus } from "@phosphor-icons/react";
import { SectionHeading } from "./SectionHeading";

type Cell = "yes" | "no" | "partial";

const COLUMNS = ["Momento App", "Email", "WhatsApp", "Google Drive", "AirDrop"];

// Column order matches COLUMNS; the first entry is always Momento App.
const ROWS: { label: string; cells: Cell[] }[] = [
  { label: "Instant QR Upload", cells: ["yes", "no", "no", "no", "no"] },
  { label: "No App Download", cells: ["yes", "yes", "no", "partial", "no"] },
  { label: "Unlimited Guests", cells: ["yes", "partial", "partial", "yes", "no"] },
  { label: "High-Resolution Photos", cells: ["yes", "partial", "no", "yes", "yes"] },
  { label: "Video Upload", cells: ["yes", "partial", "yes", "yes", "yes"] },
  { label: "Shared Album", cells: ["yes", "no", "partial", "yes", "no"] },
  { label: "Real-Time Uploads", cells: ["yes", "no", "yes", "partial", "no"] },
  { label: "Cross-Platform", cells: ["yes", "yes", "yes", "yes", "no"] },
  { label: "Secure Private Album", cells: ["yes", "partial", "no", "partial", "no"] },
  { label: "Easy Setup", cells: ["yes", "no", "no", "partial", "no"] },
];

function CellMark({ state, onAccent }: { state: Cell; onAccent?: boolean }) {
  if (onAccent) {
    return (
      <span className="inline-flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.2)", width: 26, height: 26 }}>
        <Check size={15} weight="bold" color="#fff" />
      </span>
    );
  }
  const map = {
    yes: { bg: "#DCFCE7", color: "#15803D", Icon: Check },
    no: { bg: "#FEF2F2", color: "#B91C1C", Icon: X },
    partial: { bg: "#F3F4F6", color: "#9CA3AF", Icon: Minus },
  }[state];
  const { bg, color, Icon } = map;
  return (
    <span className="inline-flex items-center justify-center rounded-full" style={{ background: bg, width: 26, height: 26 }}>
      <Icon size={15} weight="bold" color={color} />
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(to bottom, #F5F2EC 0%, #FAFAF8 100%)" }}>
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          badge="Why QR upload is better"
          title="Momento App vs. Traditional sharing"
          subtitle="See why QR-based photo upload outperforms every alternative."
        />

        {/* The table is wider than a phone; it scrolls inside its own container
            so the page body never scrolls sideways. */}
        <motion.div
          className="mt-14 overflow-x-auto rounded-3xl"
          style={{ background: "#fff", border: "1.36px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "18px 24px", fontSize: "0.875rem", fontWeight: 700, color: "#1A1A1A" }}>
                  Feature
                </th>
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    style={{
                      padding: "18px 12px",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textAlign: "center",
                      color: c === "Momento App" ? "#fff" : "#666",
                      background: c === "Momento App" ? "#556B2F" : "transparent",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                <tr key={r.label} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "14px 24px", fontSize: "0.875rem", fontWeight: 500, color: "#1A1A1A", whiteSpace: "nowrap" }}>
                    {r.label}
                  </td>
                  {r.cells.map((state, ci) => (
                    <td
                      key={COLUMNS[ci]}
                      style={{
                        padding: "14px 12px",
                        textAlign: "center",
                        background: ci === 0 ? "#556B2F" : "transparent",
                        borderBottomLeftRadius: ci === 0 && ri === ROWS.length - 1 ? 0 : undefined,
                      }}
                    >
                      <CellMark state={state} onAccent={ci === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
