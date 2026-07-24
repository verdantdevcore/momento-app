"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { DeviceMobile, QrCode, Globe, Images, UploadSimple, Heart } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const STEPS = [
  { step: "01", Icon: DeviceMobile, title: "Guest opens phone camera", description: "Any smartphone camera app works — iPhone, Android, no app required.", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
  { step: "02", Icon: QrCode, title: "Scans the QR code", description: "Point the camera at any Momento App QR sign around the venue.", color: "#7a9640", bg: "rgba(122,150,64,0.08)" },
  { step: "03", Icon: Globe, title: "Instant upload page opens", description: "A beautiful, branded upload page opens instantly in their browser.", color: "#5e7a35", bg: "rgba(94,122,53,0.08)" },
  { step: "04", Icon: Images, title: "Selects photos and videos", description: "Guests choose any photos or videos from their camera roll.", color: "#4a6229", bg: "rgba(74,98,41,0.08)" },
  { step: "05", Icon: UploadSimple, title: "Uploads successfully", description: "Full-resolution files uploaded instantly with 99.9% success rate.", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
  { step: "06", Icon: Heart, title: "Couple receives memories", description: "Every upload appears in your private album in real time.", color: "#c05a6e", bg: "rgba(192,90,110,0.08)" },
];

export function GuestJourney() {
  return (
    <section style={{ background: "#fff", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            badge="Guest upload journey"
            title={<>Six steps to a perfect<br />wedding album</>}
            subtitle="From camera to album in under 30 seconds. No friction, no confusion — just instant memories."
          />
        </div>

        <div className="grid journey-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: 20 }}>
          {STEPS.map(({ step, Icon, title, description, color, bg }, i) => (
            <motion.div
              key={step}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div style={{ fontSize: 13, color, fontWeight: 400, letterSpacing: 1, marginBottom: 12, opacity: 0.7 }}>Step {step}</div>
              <motion.div
                className="relative flex items-center justify-center"
                style={{ width: 72, height: 72, borderRadius: "50%", background: bg, border: `2px solid ${color}22`, marginBottom: 16 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon size={28} color={color} />
                {i < 5 && <div className="absolute" style={{ right: -24, top: "50%", transform: "translateY(-50%)", color: "#d1d5db", fontSize: 18, fontWeight: 300 }}>→</div>}
              </motion.div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#2d3a1c", marginBottom: 8, lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-between flex-wrap"
          style={{ marginTop: 64, background: "linear-gradient(135deg, #f4f9ee, #e8f5d8)", borderRadius: 24, padding: "40px 48px", gap: 24, border: "1px solid rgba(85,107,47,0.12)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#2d3a1c", marginBottom: 8 }}>Ready to simplify your wedding photo collection?</h3>
            <p style={{ fontSize: 16, color: "#6b7280" }}>Join 25,000+ couples who use Momento App to collect every memory.</p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Link
              href="/auth/register"
              className="inline-block"
              style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", color: "#fff", padding: "16px 32px", borderRadius: 50, fontSize: 16, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 24px rgba(85,107,47,0.3)", whiteSpace: "nowrap" }}
            >
              Generate Your QR Code
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .journey-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 640px) { .journey-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </section>
  );
}
