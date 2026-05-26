"use client";

import { motion } from "motion/react";
import { MessageSquare, Share2, Lock } from "lucide-react";

const POINTS = [
  { icon: MessageSquare, title: "Group chats get messy", desc: "Photos get buried in conversations and are impossible to find later.", bad: true },
  { icon: Share2, title: "Social media isn't private", desc: "Not everyone wants their memories public on social platforms.", bad: true },
  { icon: Lock, title: "Momento App keeps it all together", desc: "One private, organized space — accessible to everyone who was there.", bad: false },
];

export function ProblemSection() {
  return (
    <section className="py-20 px-6" style={{ background: "linear-gradient(160deg, #f3f7ee 0%, #f9f5ef 100%)" }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>
            The problem
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Event memories are <span style={{ color: "#556B2F" }}>scattered everywhere</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75, marginBottom: "1.5rem" }}>
            Today's events generate thousands of photos and videos across dozens of devices, yet memories remain fragmented and difficult to collect.
          </p>
          <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75 }}>
            Group chats get messy, and social media isn't private or organized for events. Momento App creates a simple, private, collaborative space where every attendee can contribute instantly.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="flex flex-col gap-4">
          {POINTS.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: item.bad ? "#fff" : "#556B2F", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bad ? "#fee2e2" : "#F7E7CE" }}>
                <item.icon size={18} color={item.bad ? "#dc2626" : "#556B2F"} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: item.bad ? "#1a1a1a" : "#F7E7CE", marginBottom: "0.25rem" }}>{item.title}</p>
                <p style={{ fontSize: "0.85rem", color: item.bad ? "#666" : "rgba(247,231,206,0.8)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
