"use client";

import { motion } from "motion/react";
import { UploadSimple, Image as ImageIcon, VideoCamera, DeviceMobile, QrCode, Lock, Lightning, Cloud, DownloadSimple, Monitor, ShieldCheck, GearSix } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const GREEN = { color: "#556B2F", bg: "#eef2e8" };
const GOLD = { color: "#7a6200", bg: "#fef8e8" };
const BLUE = { color: "#2563eb", bg: "#eff6ff" };
const ROSE = { color: "#9b2335", bg: "#fdf0f2" };

const FEATURES = [
  { Icon: UploadSimple, title: "Unlimited Guest Uploads", desc: "No cap on the number of guests who can contribute photos and videos to your event.", ...GREEN },
  { Icon: ImageIcon, title: "High-Resolution Photos", desc: "Original photo quality preserved — no compression, no quality loss, ever.", ...GOLD },
  { Icon: VideoCamera, title: "Video Support", desc: "Guests can upload short clips alongside their photos for a richer event story.", ...GREEN },
  { Icon: DeviceMobile, title: "No App Download", desc: "Works on any smartphone browser — iOS or Android — instantly via QR code scan.", ...BLUE },
  { Icon: QrCode, title: "QR Code Generation", desc: "Get a unique, branded QR code for your event that you can print and display anywhere.", ...GOLD },
  { Icon: Lock, title: "Private Event Albums", desc: "Your album is protected and only accessible to guests with your QR code link.", ...ROSE },
  { Icon: Lightning, title: "Live Uploads", desc: "Watch photos and videos appear in your album in real time as guests upload them.", ...GREEN },
  { Icon: Cloud, title: "Secure Cloud Storage", desc: "All media is stored in enterprise-grade secure cloud infrastructure with automatic backups.", ...BLUE },
  { Icon: DownloadSimple, title: "Album Downloads", desc: "Download your entire event album in a single click — including all guest content.", ...GOLD },
  { Icon: Monitor, title: "Multi-Device Compatible", desc: "Works seamlessly on phones, tablets, laptops, and desktops for organizers and guests.", ...ROSE },
  { Icon: ShieldCheck, title: "Secure Sharing", desc: "Share your album link confidently — with optional password protection available.", ...GREEN },
  { Icon: GearSix, title: "Easy Event Management", desc: "Manage multiple events, moderate content, and track uploads from a clean dashboard.", ...BLUE },
];

export function Features() {
  return (
    <section id="features" style={{ background: "#fafaf8", padding: "96px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="Platform features"
            title="Everything you need for event photo sharing"
            subtitle="Momento App combines powerful features with radical simplicity — so you can focus on the event, not the tech."
            subtitleMaxWidth={540}
          />
        </div>

        <div className="grid features-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #eeede8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.4 }}
              whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
            >
              <span className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, color: f.color, marginBottom: 14 }}>
                <f.Icon size={20} weight="regular" />
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .features-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
