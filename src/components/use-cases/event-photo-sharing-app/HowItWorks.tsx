"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarPlus, QrCode, MapPin, UploadSimple, Images } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const GREEN = { color: "#556B2F", bg: "#eef2e8" };
const GOLD = { color: "#7a6200", bg: "#fef8e8" };

const STEPS = [
  { Icon: CalendarPlus, step: "01", title: "Create Your Event", desc: "Set up your event in minutes. Add a name, date, and optional branding. No technical skills required.", ...GREEN },
  { Icon: QrCode, step: "02", title: "Generate Your QR Code", desc: "Momento App instantly creates a unique QR code and shareable link for your event album.", ...GOLD },
  { Icon: MapPin, step: "03", title: "Display It at the Venue", desc: "Print and place QR codes at tables, entrances, name badges, screens, and photo booths.", ...GREEN },
  { Icon: UploadSimple, step: "04", title: "Guests Upload Photos & Videos", desc: "Attendees scan the QR code, select their photos, and upload directly from any smartphone or device — no app needed.", ...GOLD },
  { Icon: Images, step: "05", title: "Enjoy One Shared Album", desc: "All content arrives in your curated event album instantly. Download, share, or relive every moment.", ...GREEN },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: "linear-gradient(180deg, #f8f5f0 0%, #ffffff 100%)", padding: "96px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 72 }}>
          <SectionHeader badge="Simple setup" title="How Momento App works" />
        </div>

        <div className="relative">
          <div className="steps-line" style={{ position: "absolute", top: 52, left: "calc(10% + 24px)", right: "calc(10% + 24px)", height: 2, background: "linear-gradient(to right, #556B2F, #8BA84A, #556B2F)", opacity: 0.3, zIndex: 0 }} />

          <div className="grid steps-grid relative" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem", zIndex: 1 }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.12 * i, duration: 0.5 }}
              >
                <div className="relative flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: "50%", background: s.bg, border: `3px solid ${s.color}`, color: s.color, marginBottom: 20, boxShadow: "0 4px 20px rgba(85,107,47,0.15)" }}>
                  <s.Icon size={26} weight="regular" />
                  <span className="absolute flex items-center justify-center rounded-full" style={{ top: -8, right: -8, width: 24, height: 24, background: s.color, color: "#fff", fontSize: 10, fontWeight: 800 }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center"
          style={{ marginTop: 56 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2"
            style={{ background: "#556B2F", color: "#fff", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(85,107,47,0.25)" }}
          >
            Start Your First Event — Free
          </Link>
          <p style={{ fontSize: 13, color: "#999", marginTop: 12 }}>No credit card required. Setup takes under 2 minutes.</p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) { .steps-grid { grid-template-columns: 1fr 1fr !important; } .steps-line { display: none !important; } }
        @media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
