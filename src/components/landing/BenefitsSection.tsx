"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

const HOST = [
  { title: "Collect Every Memory", desc: "No more chasing guests for photos after the event." },
  { title: "Simple Guest Experience", desc: "Guests can contribute instantly without complicated steps." },
  { title: "Private & Organized", desc: "Keep all event memories secure and beautifully organized in one place." },
  { title: "Real-Time Sharing", desc: "See moments appear live as your event unfolds." },
];

const GUEST = [
  { title: "Share Instantly", desc: "Upload your favorite moments in seconds." },
  { title: "See Every Perspective", desc: "Enjoy photos and videos captured by everyone at the event." },
  { title: "No Messy Group Chats", desc: "Everything lives in one dedicated shared album." },
  { title: "Stay Connected", desc: "Relive the celebration long after it ends." },
];

function List({ items, dark }: { items: typeof HOST; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <motion.div key={item.title} initial={{ opacity: 0, x: dark ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex items-start gap-3">
          <CheckCircle2 size={20} color={dark ? "#F7E7CE" : "#556B2F"} className="flex-shrink-0 mt-0.5" />
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: dark ? "#F7E7CE" : "#1a1a1a", marginBottom: "0.15rem" }}>{item.title}</p>
            <p style={{ fontSize: "0.85rem", color: dark ? "rgba(247,231,206,0.75)" : "#666", lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}>For everyone at the event</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>Designed for hosts and guests alike</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="p-8 rounded-3xl" style={{ background: "#f3f7ee", border: "1px solid rgba(85,107,47,0.1)" }}>
            <div className="mb-6">
              <p className="text-sm px-3 py-1 rounded-full inline-block mb-3" style={{ fontWeight: 600, background: "#556B2F", color: "#F7E7CE", fontSize: "0.8rem" }}>For Event Hosts</p>
              <p style={{ fontWeight: 800, fontSize: "1.35rem", color: "#1a1a1a" }}>Run your event effortlessly</p>
            </div>
            <List items={HOST} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="p-8 rounded-3xl" style={{ background: "#556B2F" }}>
            <div className="mb-6">
              <p className="text-sm px-3 py-1 rounded-full inline-block mb-3" style={{ fontWeight: 600, background: "rgba(247,231,206,0.2)", color: "#F7E7CE", fontSize: "0.8rem" }}>For Guests</p>
              <p style={{ fontWeight: 800, fontSize: "1.35rem", color: "#F7E7CE" }}>Share and relive your way</p>
            </div>
            <List items={GUEST} dark />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
