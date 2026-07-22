"use client";

import { motion } from "motion/react";
import { QrCode, Infinity as InfinityIcon, VideoCamera, Sparkle, Browser, Lock, Lightning, DownloadSimple } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const FEATURES = [
  { icon: QrCode, iconBg: "#F0F4E8", iconColor: "#556B2F", title: "QR Upload", body: "One scan and guests are uploading — no friction, no accounts." },
  { icon: InfinityIcon, iconBg: "#E8F0F8", iconColor: "#4A7CA8", title: "Unlimited Uploads", body: "No limits on photos, guests, or storage. Upload as much as you want." },
  { icon: VideoCamera, iconBg: "#F0EBF8", iconColor: "#7A5EA8", title: "Video Support", body: "Guests can upload video clips alongside photos in the same album." },
  { icon: Sparkle, iconBg: "#F7E7CE", iconColor: "#B5803A", title: "High Resolution", body: "Every photo is stored in full resolution — no compression, no quality loss." },
  { icon: Browser, iconBg: "#E6F4EF", iconColor: "#2E8B6F", title: "Browser-Based Upload", body: "Works on any device with a browser. iOS, Android, desktop — all welcome." },
  { icon: Lock, iconBg: "#FDECEA", iconColor: "#C1554A", title: "Secure Private Album", body: "Your album is private by default. Control who can view and upload." },
  { icon: Lightning, iconBg: "#FEF3E2", iconColor: "#C8862B", title: "Instant Sync", body: "Photos appear in the shared album the moment they're uploaded." },
  { icon: DownloadSimple, iconBg: "#F0F4E8", iconColor: "#556B2F", title: "Download Anytime", body: "Export your entire album as a ZIP file whenever you're ready." },
];

export function FeaturesGrid() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Features"
          title="Everything you need in one album"
          subtitle="Designed for organizers who want powerful features without complexity."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ background: "#FAFAF8", border: "1.36px solid #F3F4F6" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.08, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center" style={{ background: f.iconBg, width: 44, height: 44, borderRadius: 14 }}>
                  <Icon size={20} color={f.iconColor} />
                </div>

                <h3 className="mt-4" style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "24px" }}>
                  {f.title}
                </h3>
                <p className="mt-2" style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#777", lineHeight: "20.8px" }}>
                  {f.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
