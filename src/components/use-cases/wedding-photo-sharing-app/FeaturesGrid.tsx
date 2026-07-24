"use client";

import { motion } from "motion/react";
import {
  DeviceMobile,
  VideoCamera,
  Infinity as InfinityIcon,
  Lock,
  Image as ImageIcon,
  QrCode,
  ShareNetwork,
  Lightning,
  DownloadSimple,
  Cloud,
} from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

// The design lays these out on a four-column grid where the first and the
// high-resolution card each run double width, which is what `wide` encodes.
const FEATURES = [
  {
    icon: DeviceMobile,
    title: "No App Download Required",
    body: "Guests scan your QR code or join using the link and upload directly to your event feed. Zero friction, flawless participation.",
    wide: true,
  },
  {
    icon: VideoCamera,
    title: "Video Uploads",
    body: "Capture speeches, first dances, and toasts in full HD video.",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited Photo Uploads",
    body: "No storage limits. Every guest can upload as many photos as they want.",
  },
  {
    icon: Lock,
    title: "Private Shared Album",
    body: "Only guests with your QR code can view and upload. Completely private.",
  },
  {
    icon: ImageIcon,
    title: "High-Resolution Images",
    body: "Original quality photos preserved forever, not compressed.",
    wide: true,
  },
  {
    icon: QrCode,
    title: "Custom QR Code",
    body: "Beautiful branded QR codes ready to print on any wedding stationery.",
  },
  {
    icon: ShareNetwork,
    title: "Easy Sharing",
    body: "Share the album link with family and friends before, during or after the event.",
  },
  {
    icon: Lightning,
    title: "Real-Time Uploads",
    body: "Photos appear in the album instantly as guests upload them.",
  },
  {
    icon: DownloadSimple,
    title: "Download Everything",
    body: "Download your entire album as a ZIP file anytime, forever.",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Storage",
    body: "Military-grade encryption. Your memories are safe and backed up.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-28" style={{ background: "#FDFAF6" }}>
      <div className="site-container">
        <SectionHeading
          badge="Everything you need"
          title={
            <>
              Built for the <span style={{ color: "#556B2F" }}>perfect wedding experience</span>
            </>
          }
          subtitle="Every feature designed to make collecting and reliving wedding memories effortless for couples and guests alike."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className={`bg-white ${f.wide ? "lg:col-span-2" : ""}`}
                style={{ borderRadius: 16, border: "1.36px solid #EFE7DB", padding: 24 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.07, ease: "easeOut" }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: 12, background: "#F7E7CE" }}
                >
                  <Icon size={18} color="#556B2F" />
                </span>

                <h3 className="mt-5" style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "24px" }}>
                  {f.title}
                </h3>
                <p className="mt-2" style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "22.4px" }}>
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
