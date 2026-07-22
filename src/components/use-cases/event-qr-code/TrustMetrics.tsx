"use client";

import { motion } from "motion/react";

const METRICS = [
  { value: "50K+", label: "Events Created" },
  { value: "5M+", label: "Photos Uploaded" },
  { value: "200+", label: "Countries" },
  { value: "99.9%", label: "Upload Success Rate" },
];

export function TrustMetrics() {
  return (
    <section
      className="bg-white"
      style={{ borderTop: "1.36px solid #F3F4F6", borderBottom: "1.36px solid #F3F4F6", paddingTop: 65, paddingBottom: 65 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="text-center uppercase"
          style={{ fontSize: "0.875rem", fontWeight: 500, color: "#888", letterSpacing: "1.12px", lineHeight: "21px" }}
        >
          Trusted by event organizers worldwide
        </p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            >
              <p style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#556B2F", lineHeight: 1 }}>
                {m.value}
              </p>
              <p className="mt-2" style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#666", lineHeight: "22.5px" }}>
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
