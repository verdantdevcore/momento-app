"use client";

import { motion } from "motion/react";
import { Door, ClipboardText, Table, Monitor, BookOpen, IdentificationBadge, Camera, SignOut } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const PLACEMENTS = [
  { icon: Door, title: "Welcome Sign", body: "Greet guests at the entrance with a branded QR display" },
  { icon: ClipboardText, title: "Registration Desk", body: "Capture photos from the moment guests check in" },
  { icon: Table, title: "Table Cards", body: "Place on every table for continuous uploads throughout the event" },
  { icon: Monitor, title: "Event Screens", body: "Display prominently on large screens and digital signage" },
  { icon: BookOpen, title: "Menus & Programs", body: "Print on menus, programs, and printed materials" },
  { icon: IdentificationBadge, title: "Name Badges", body: "Every attendee carries the QR code on their badge" },
  { icon: Camera, title: "Photo Booth", body: "Let guests instantly upload photo booth prints" },
  { icon: SignOut, title: "Exit Signage", body: "Capture last-minute memories as guests depart" },
];

export function QrCodePlacement() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="QR placement guide"
          title="Display your QR code everywhere"
          subtitle="Maximum reach means maximum uploads. Place your QR code at every touchpoint."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLACEMENTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                className="rounded-2xl p-6"
                style={{ background: "#FAFAF8", border: "1.36px solid #F3F4F6" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.08, ease: "easeOut" }}
              >
                <div
                  className="flex items-center justify-center bg-white"
                  style={{ width: 56, height: 56, borderRadius: 14, border: "1.36px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <Icon size={28} color="#556B2F" />
                </div>

                <h3 className="mt-4" style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1A1A", lineHeight: "24px" }}>
                  {p.title}
                </h3>
                <p className="mt-2" style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#777", lineHeight: "19.5px" }}>
                  {p.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
