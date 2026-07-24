"use client";

import { motion } from "motion/react";
import { Heart, Images, Globe, ShieldCheck } from "@phosphor-icons/react";

const METRICS = [
  { icon: Heart, value: "500+", label: "Wedding Albums Created" },
  { icon: Images, value: "500K+", label: "Photos Shared" },
  { icon: Globe, value: "100+", label: "Countries" },
  { icon: ShieldCheck, value: "99.99%", label: "Guest Upload Success" },
];

export function TrustMetrics() {
  return (
    <section
      className="bg-white"
      style={{ borderTop: "1.36px solid rgba(247,231,206,0.8)", borderBottom: "1.36px solid rgba(247,231,206,0.8)", paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="site-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                className="flex flex-col items-center gap-3 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              >
                <span className="flex items-center justify-center" style={{ background: "#F7E7CE", width: 48, height: 48, borderRadius: 16 }}>
                  <Icon size={22} color="#556B2F" />
                </span>
                <div>
                  <p style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.6rem)", fontWeight: 400, color: "#556B2F", lineHeight: 1 }}>{m.value}</p>
                  <p className="mt-1.5" style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "20px" }}>{m.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
