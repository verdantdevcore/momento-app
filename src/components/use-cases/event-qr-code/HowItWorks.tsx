"use client";

import { motion } from "motion/react";
import { CalendarPlus, QrCode, Printer, UploadSimple } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const STEPS = [
  {
    step: "STEP 01",
    stepColor: "#556B2F",
    iconBg: "#F0F4E8",
    icon: CalendarPlus,
    title: "Create an Event",
    body: "Set up your event album in minutes — add a name, date, and cover photo.",
  },
  {
    step: "STEP 02",
    stepColor: "#B5803A",
    iconBg: "#F7E7CE",
    icon: QrCode,
    title: "Generate a QR Code",
    body: "Receive a unique QR code instantly, ready to share with your guests.",
  },
  {
    step: "STEP 03",
    stepColor: "#4A7CA8",
    iconBg: "#E8F0F8",
    icon: Printer,
    title: "Display It Anywhere",
    body: "Print it on welcome signs, table cards, programs, screens, or badges.",
  },
  {
    step: "STEP 04",
    stepColor: "#7A5EA8",
    iconBg: "#F0EBF8",
    icon: UploadSimple,
    title: "Guests Upload",
    body: "Guests scan, upload photos and videos directly into your shared album — no app needed.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(to bottom, #FAFAF8 0%, #F5F2EC 100%)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="How it works"
          title="Event QR code photo upload in 4 steps"
          subtitle="From setup to a full shared album — the entire process takes minutes."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                className="relative bg-white rounded-3xl p-7"
                style={{ border: "1.36px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center rounded-2xl" style={{ background: s.iconBg, width: 48, height: 48 }}>
                  <Icon size={24} color={s.stepColor} />
                </div>

                <p className="mt-5" style={{ fontSize: "0.75rem", fontWeight: 700, color: s.stepColor, letterSpacing: "0.72px", lineHeight: "18px" }}>
                  {s.step}
                </p>
                <h3 className="mt-2" style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "23.4px" }}>
                  {s.title}
                </h3>
                <p className="mt-3" style={{ fontSize: "0.875rem", fontWeight: 400, color: "#666", lineHeight: "22.4px" }}>
                  {s.body}
                </p>

                {/* Connector between cards, as in the design — only between columns on wide screens */}
                {i < STEPS.length - 1 && (
                  <span
                    className="hidden lg:block absolute"
                    style={{ background: "#E5E7EB", height: 2, width: 24, right: -24, top: 40 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
