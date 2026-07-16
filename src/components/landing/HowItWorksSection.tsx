"use client";

import { motion } from "motion/react";
import { PlusCircle, ShareNetwork, Camera, Play } from "@phosphor-icons/react";

const STEPS = [
  { number: "01", icon: PlusCircle, title: "Create", desc: "Start a private shared album for your event in seconds.", bg: "#f3f7ee", dark: false },
  { number: "02", icon: ShareNetwork, title: "Share", desc: "Invite guests with one tap using a simple link or QR code.", bg: "#F7E7CE", dark: false },
  { number: "03", icon: Camera, title: "Capture Together", desc: "Everyone contributes photos and videos instantly — no setup or signup required.", bg: "#f3f7ee", dark: false },
  { number: "04", icon: Play, title: "Relive Forever", desc: "Enjoy every moment from every perspective, all in one beautiful place.", bg: "#556B2F", dark: true },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>
            Simple by design
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>How it works</h2>
          <p style={{ fontSize: "1rem", color: "#666", maxWidth: "440px", margin: "0.75rem auto 0", lineHeight: 1.7 }}>
            Four simple steps to capture and relive every event memory together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
              className="relative flex flex-col gap-4 p-7 rounded-3xl" style={{ background: step.bg }}>
              <span style={{ fontWeight: 800, fontSize: "3rem", lineHeight: 1, color: step.dark ? "rgba(247,231,206,0.3)" : "rgba(85,107,47,0.15)" }}>{step.number}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: step.dark ? "rgba(247,231,206,0.2)" : "#556B2F" }}>
                <step.icon size={22} color="#F7E7CE" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.2rem", color: step.dark ? "#F7E7CE" : "#1a1a1a", marginBottom: "0.4rem" }}>{step.title}</p>
                <p style={{ fontSize: "0.88rem", color: step.dark ? "rgba(247,231,206,0.85)" : "#666", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 items-center justify-center rounded-full" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6H10M7 3L10 6L7 9" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
