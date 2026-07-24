"use client";

import { motion } from "motion/react";
import { X, Check, DeviceMobile, Users, FolderMinus, Camera, HardDrives, ArrowRight } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const ROWS = [
  {
    problem: { Icon: FolderMinus, title: "Photos scattered across devices", desc: "Event memories are lost across hundreds of guest phones, never to be collected." },
    solution: { Icon: HardDrives, title: "One central event album", desc: "All photos automatically flow into a single shared album the moment guests upload them." },
  },
  {
    problem: { Icon: Users, title: "Difficult follow-up with attendees", desc: "Chasing guests post-event to share their photos is time-consuming and often fruitless." },
    solution: { Icon: Camera, title: "Upload happens at the event", desc: "Guests contribute photos in real time via QR code — no follow-up needed." },
  },
  {
    problem: { Icon: DeviceMobile, title: "Requires app downloads", desc: "Asking guests to install an app creates friction and dramatically reduces participation." },
    solution: { Icon: Check, title: "Zero app download required", desc: "Guests simply scan a QR code and upload directly from any browser — instant access." },
  },
  {
    problem: { Icon: Camera, title: "Inconsistent photo quality", desc: "Compressed WhatsApp photos and email attachments destroy the quality of event memories." },
    solution: { Icon: Camera, title: "Full-resolution uploads", desc: "Momento App preserves original photo quality so every shot looks its best." },
  },
];

export function ChallengesSolutions() {
  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="The problem & solution"
            title="Why event organizers choose Momento App"
            subtitle="Traditional methods fail event organizers. Momento App was built specifically to solve these frustrations."
            subtitleMaxWidth={540}
          />
        </div>

        {/* Column labels */}
        <div className="grid compare-header" style={{ gridTemplateColumns: "1fr 60px 1fr", marginBottom: 16 }}>
          <div className="text-center" style={{ padding: "10px 0" }}>
            <span className="inline-flex items-center gap-2 rounded-full" style={{ background: "#fef0f0", border: "1px solid #fdd", padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#c53030" }}>
              <X size={14} weight="bold" /> Without Momento
            </span>
          </div>
          <div />
          <div className="text-center" style={{ padding: "10px 0" }}>
            <span className="inline-flex items-center gap-2 rounded-full" style={{ background: "#eef2e8", border: "1px solid #c8d8b0", padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#556B2F" }}>
              <Check size={14} weight="bold" /> With Momento App
            </span>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: "1rem" }}>
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              className="grid items-center compare-row"
              style={{ gridTemplateColumns: "1fr 60px 1fr" }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <div className="flex items-start" style={{ gap: 16, background: "#fff8f8", border: "1px solid #fde8e8", borderRadius: "16px 0 0 16px", padding: 24 }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 10, background: "#fee2e2", color: "#c53030" }}>
                  <row.problem.Icon size={20} weight="regular" />
                </span>
                <div>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>{row.problem.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.6 }}>{row.problem.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-center" style={{ background: "#f5f5f5", height: "100%", padding: "24px 0" }}>
                <span className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#556B2F", color: "#fff" }}>
                  <ArrowRight size={14} weight="bold" />
                </span>
              </div>

              <div className="flex items-start" style={{ gap: 16, background: "#f6faf0", border: "1px solid #d4e8b8", borderRadius: "0 16px 16px 0", padding: 24 }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 10, background: "#d4f0b8", color: "#3a6620" }}>
                  <row.solution.Icon size={20} weight="regular" />
                </span>
                <div>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>{row.solution.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#556", lineHeight: 1.6 }}>{row.solution.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .compare-header { display: none !important; }
          .compare-row { grid-template-columns: 1fr !important; gap: 8px !important; }
          .compare-row > div:nth-child(1) { border-radius: 16px !important; }
          .compare-row > div:nth-child(2) { display: none !important; }
          .compare-row > div:nth-child(3) { border-radius: 16px !important; }
        }
      `}</style>
    </section>
  );
}
