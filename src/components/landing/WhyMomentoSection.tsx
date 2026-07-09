"use client";

import { motion } from "motion/react";

const COLS = [
  { label: "WhatsApp Groups", items: ["Photos buried in chat", "Disorganized", "Hard to find later", "Not event-focused"], bad: true },
  { label: "Social Media", items: ["Not private", "Public by default", "Not event-specific", "Scattered across apps"], bad: true },
  { label: "Momento App", items: ["Private & organized", "Built for live events", "Every perspective captured", "One shared space"], bad: false },
];

export function WhyMomentoSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>The difference</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>Why Momento App?</h2>
          <p style={{ fontSize: "1rem", color: "#666", maxWidth: "520px", margin: "0.75rem auto 0", lineHeight: 1.7 }}>
            Unlike generic cloud storage or social media platforms, Momento App is purpose-built for live events — making event memory collection effortless, collaborative, and private.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLS.map((col, i) => (
            <motion.div key={col.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
              className="p-7 rounded-3xl flex flex-col gap-5"
              style={{ background: col.bad ? "#fff" : "#556B2F", border: col.bad ? "1px solid rgba(0,0,0,0.07)" : "none", boxShadow: col.bad ? "0 2px 16px rgba(0,0,0,0.05)" : "0 8px 40px rgba(85,107,47,0.25)" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "1.1rem" }}>{col.bad ? "❌" : "✅"}</span>
                <p style={{ fontWeight: 800, fontSize: "1.1rem", color: col.bad ? "#1a1a1a" : "#F7E7CE" }}>{col.label}</p>
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.bad ? "#ccc" : "#F7E7CE" }} />
                    <p style={{ fontSize: "0.88rem", color: col.bad ? "#555" : "rgba(247,231,206,0.9)", lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
