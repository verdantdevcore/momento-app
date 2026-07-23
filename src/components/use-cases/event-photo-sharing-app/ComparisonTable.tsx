"use client";

import { motion } from "motion/react";
import { Check, X, Minus } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const COMPETITORS = ["Momento App", "Google Drive", "WhatsApp", "Dropbox", "Email", "AirDrop"];

type Val = boolean | "partial";
const ROWS: { label: string; values: Val[] }[] = [
  { label: "QR Code Uploads", values: [true, false, false, false, false, false] },
  { label: "Unlimited Guests", values: [true, false, false, false, false, false] },
  { label: "Shared Event Album", values: [true, "partial", false, "partial", false, false] },
  { label: "Live Uploads", values: [true, false, false, false, false, false] },
  { label: "Full Photo Quality", values: [true, true, false, true, false, false] },
  { label: "Video Support", values: [true, true, true, true, "partial", false] },
  { label: "Auto Organization", values: [true, false, false, false, false, false] },
  { label: "No App Required", values: [true, false, false, false, true, false] },
  { label: "Event Branding", values: [true, false, false, false, false, false] },
  { label: "Album Downloads", values: [true, true, false, true, false, false] },
];

function Cell({ value }: { value: Val }) {
  if (value === true) return <Check size={18} weight="bold" color="#556B2F" />;
  if (value === "partial") return <Minus size={18} weight="bold" color="#F59E0B" />;
  return <X size={18} weight="bold" color="#d1d5db" />;
}

export function ComparisonTable() {
  return (
    <section style={{ background: "#fafaf8", padding: "96px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 56 }}>
          <SectionHeader
            badge="Platform comparison"
            title="Momento App vs. the alternatives"
            subtitle="No other tool was designed specifically for event photo sharing. See why organizers make the switch."
          />
        </div>

        <motion.div
          style={{ overflowX: "auto" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "16px 20px", fontSize: 13, fontWeight: 600, color: "#888", borderBottom: "2px solid #eee", background: "#fff", borderRadius: "16px 0 0 0" }}>Feature</th>
                {COMPETITORS.map((comp, i) => (
                  <th
                    key={comp}
                    style={{ textAlign: "center", padding: "16px 12px", fontSize: 13, fontWeight: 700, borderBottom: i === 0 ? "2px solid #556B2F" : "2px solid #eee", background: i === 0 ? "#eef2e8" : "#fff", color: i === 0 ? "#556B2F" : "#3a3a3a", borderRadius: i === COMPETITORS.length - 1 ? "0 16px 0 0" : 0, whiteSpace: "nowrap" }}
                  >
                    {i === 0 && <span className="inline-block rounded-full align-middle" style={{ width: 8, height: 8, background: "#556B2F", marginRight: 6 }} />}
                    {comp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                  <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 500, color: "#2a2a2a", borderBottom: "1px solid #f0f0f0" }}>{r.label}</td>
                  {r.values.map((val, j) => (
                    <td key={j} style={{ textAlign: "center", padding: "16px 12px", borderBottom: "1px solid #f0f0f0", background: j === 0 ? (i % 2 === 0 ? "#f6faf0" : "#eef2e8") : "inherit" }}>
                      <div className="flex justify-center"><Cell value={val} /></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: 20, borderTop: "2px solid #eee", background: "#fff", borderRadius: "0 0 0 16px" }} />
                <td style={{ textAlign: "center", padding: "20px 12px", background: "#eef2e8", borderTop: "2px solid #556B2F" }}>
                  <a href="/auth/register" className="inline-block" style={{ background: "#556B2F", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free</a>
                </td>
                {COMPETITORS.slice(1).map((c, i) => (
                  <td key={c} className="text-center" style={{ padding: "20px 12px", background: "#fff", borderTop: "2px solid #eee", borderRadius: i === COMPETITORS.length - 2 ? "0 0 16px 0" : 0 }}>
                    <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>Not designed for events</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </motion.div>

        <div className="flex justify-center" style={{ gap: 24, marginTop: 20 }}>
          <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "#666" }}><Check size={14} weight="bold" color="#556B2F" /> Full support</span>
          <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "#666" }}><Minus size={14} weight="bold" color="#F59E0B" /> Partial</span>
          <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "#666" }}><X size={14} weight="bold" color="#d1d5db" /> Not supported</span>
        </div>
      </div>
    </section>
  );
}
