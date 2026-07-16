"use client";

import { motion } from "motion/react";
import { Shield, Lightning, Users, Heart } from "@phosphor-icons/react";

const ITEMS = [
  { icon: Shield, label: "Private by default", desc: "Your memories, securely shared." },
  { icon: Lightning, label: "Fast & simple", desc: "Fast, simple, and guest-friendly." },
  { icon: Users, label: "Real connections", desc: "Designed for real events and real connections." },
  { icon: Heart, label: "Every perspective", desc: "Every guest captures a different story." },
];

export function TrustSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ fontWeight: 800, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "#1a1a1a", lineHeight: 1.3, marginBottom: "0.75rem" }}>
          Because the best memories are the ones <span style={{ color: "#556B2F" }}>shared together</span>
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "1.05rem", color: "#666", maxWidth: "520px", margin: "0 auto 3rem" }}>
          Some moments happen once. Keep every perspective forever.
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ITEMS.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl" style={{ background: "#f9f5ef" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#556B2F" }}>
                <item.icon size={22} color="#F7E7CE" />
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>{item.label}</p>
              <p style={{ fontSize: "0.82rem", color: "#777", lineHeight: 1.5 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
