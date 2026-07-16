"use client";

import { motion } from "motion/react";
import { Lock, Upload, UserCheck, Broadcast, FolderOpen, Sparkle } from "@phosphor-icons/react";

const FEATURES = [
  { icon: Lock, title: "Private Event Albums", desc: "Keep every event secure and invite-only. Your memories stay between the people who were there." },
  { icon: Upload, title: "Instant Photo & Video Uploads", desc: "Guests can contribute memories in real time as the event unfolds." },
  { icon: UserCheck, title: "Guest-Friendly Sharing", desc: "No complicated setup required. Join and start sharing in seconds." },
  { icon: Broadcast, title: "Real-Time Memory Collection", desc: "Watch moments appear live during the event — every photo, every perspective." },
  { icon: FolderOpen, title: "Easy Access for Everyone", desc: "Everything stays organized in one shared place for hosts and attendees alike." },
  { icon: Sparkle, title: "Secure and Simple Experience", desc: "Designed to feel effortless for everyone at the event." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: "linear-gradient(160deg, #f9f5ef 0%, #fff 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>Core features</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>Built for modern events</h2>
          <p style={{ fontSize: "1rem", color: "#666", maxWidth: "440px", margin: "0.75rem auto 0", lineHeight: 1.7 }}>Every feature designed with simplicity and privacy at its core.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex flex-col gap-4 p-7 rounded-3xl transition-all hover:-translate-y-1"
              style={{ background: "#fff", boxShadow: "0 2px 20px rgba(85,107,47,0.07)", border: "1px solid rgba(85,107,47,0.08)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: "#f3f7ee" }}>
                <f.icon size={22} color="#556B2F" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a1a1a", marginBottom: "0.4rem" }}>{f.title}</p>
                <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
