"use client";

import { motion } from "motion/react";
import { Lightning, Infinity as InfinityIcon, VideoCamera, DeviceMobile, Lock, Image as ImageIcon, ArrowsClockwise, DownloadSimple, ShieldCheck, QrCode } from "@phosphor-icons/react";
import { SectionHeader, Accent } from "./SectionHeader";

const FEATURES = [
  { Icon: Lightning, title: "Instant Guest Uploads", description: "Guests upload photos and videos the moment they scan — no waiting, no lag, no friction.", accent: "#556B2F", bg: "rgba(85,107,47,0.07)", large: true },
  { Icon: InfinityIcon, title: "Unlimited Photos", description: "No caps. Every single photo from every guest, all in one album.", accent: "#7a9640", bg: "rgba(122,150,64,0.07)" },
  { Icon: VideoCamera, title: "Video Upload Support", description: "Guests can share video clips alongside photos for a richer wedding story.", accent: "#5e7a35", bg: "rgba(94,122,53,0.07)" },
  { Icon: DeviceMobile, title: "No App Required", description: "Works from any browser on any device. No App Store, no account, no barriers.", accent: "#556B2F", bg: "rgba(85,107,47,0.07)", large: true },
  { Icon: Lock, title: "Private Shared Album", description: "Your album is password-protected and only accessible to you and approved guests.", accent: "#4a6229", bg: "rgba(74,98,41,0.07)" },
  { Icon: ImageIcon, title: "High-Resolution Images", description: "Full-quality originals preserved — no compression, no quality loss.", accent: "#7a9640", bg: "rgba(122,150,64,0.07)" },
  { Icon: ArrowsClockwise, title: "Real-Time Sync", description: "Watch your album fill up live as guests upload throughout the day.", accent: "#556B2F", bg: "rgba(85,107,47,0.07)" },
  { Icon: DownloadSimple, title: "Download Entire Album", description: "One-click download of your complete wedding album as a ZIP file.", accent: "#5e7a35", bg: "rgba(94,122,53,0.07)" },
  { Icon: ShieldCheck, title: "Secure Cloud Storage", description: "All photos stored on encrypted servers with automatic backups.", accent: "#4a6229", bg: "rgba(74,98,41,0.07)" },
  { Icon: QrCode, title: "Personalized QR Code", description: "Your unique, beautifully styled QR code customised to your wedding aesthetic.", accent: "#556B2F", bg: "rgba(85,107,47,0.07)", large: true },
];

export function FeatureGrid() {
  return (
    <section id="features" style={{ background: "linear-gradient(160deg, #fafdf7 0%, #f9faf5 100%)", padding: "100px 24px" }}>
      <div className="site-container">
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            badge="Core features"
            title={<>Everything you need for<br /><Accent>perfect wedding photo sharing</Accent></>}
            subtitle="One QR code unlocks a complete wedding photo ecosystem — built for couples, loved by guests."
          />
        </div>

        <div className="grid feature-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {FEATURES.map(({ Icon, title, description, accent, bg, large }, i) => (
            <motion.div
              key={title}
              className="relative overflow-hidden"
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: large ? "36px 32px" : "28px 26px",
                border: "1px solid rgba(85,107,47,0.08)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                gridColumn: large ? "span 2" : "span 1",
                display: "flex",
                gap: large ? 28 : 0,
                flexDirection: large ? "row" : "column",
                alignItems: "flex-start",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.1)" }}
            >
              <div className="absolute" style={{ top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: bg, filter: "blur(20px)" }} />
              <span
                className="flex items-center justify-center shrink-0"
                style={{ width: large ? 60 : 52, height: large ? 60 : 52, borderRadius: large ? 18 : 16, background: bg, border: `1px solid ${accent}22`, marginBottom: large ? 0 : 20 }}
              >
                <Icon size={large ? 28 : 24} color={accent} />
              </span>
              <div className="relative" style={{ flex: 1 }}>
                <h3 style={{ fontSize: large ? 22 : 18, fontWeight: 700, color: "#2d3a1c", marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .feature-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .feature-grid > *[style*="span 2"] { flex-direction: column !important; }
        }
        @media (max-width: 480px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .feature-grid > *[style*="span 2"] { grid-column: span 1 !important; }
        }
      `}</style>
    </section>
  );
}
