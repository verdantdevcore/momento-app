"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  WhatsappLogo,
  InstagramLogo,
  DeviceMobile,
  ShareNetwork,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

// Each row keeps its channel's own brand colour — the design tints the icon tile
// with the same hue at 9.4% so the five rows read as five different places photos
// get stranded rather than one styled list.
const SCATTERED = [
  { icon: WhatsappLogo, color: "#25D366", label: "WhatsApp Groups", note: "Only shared with a few" },
  { icon: InstagramLogo, color: "#E1306C", label: "Instagram Stories", note: "Disappear after 24 hrs" },
  { icon: DeviceMobile, color: "#007AFF", label: "AirDrop", note: "Only works nearby" },
  { icon: ShareNetwork, color: "#34AADC", label: "Text Messages", note: "Low resolution" },
  { icon: WarningCircle, color: "#FF9500", label: "Camera Roll", note: "Never gets shared" },
];

const ALBUM = [
  { src: "/use-cases/wedding/album-ceremony.jpg", alt: "Ceremony under chandeliers" },
  { src: "/use-cases/wedding/album-sunset-dance.jpg", alt: "Couple dancing at sunset" },
  { src: "/use-cases/wedding/album-couple.jpg", alt: "Bride and groom portrait" },
  { src: "/use-cases/wedding/album-tablescape.jpg", alt: "Reception table setting" },
  { src: "/use-cases/wedding/album-cake.jpg", alt: "Wedding cake" },
  { src: "/use-cases/wedding/album-bouquet.jpg", alt: "Bridal bouquet" },
];

const BENEFITS = [
  "Every guest's photos in one place",
  "High-resolution, always accessible",
  "Download everything anytime",
];

const CARD = { borderRadius: 24, padding: 32 } as const;
const PILL = { borderRadius: 16, padding: "12px 20px", fontSize: "0.875rem", fontWeight: 600, lineHeight: "20px" } as const;

export function ProblemSection() {
  return (
    <section className="py-28" style={{ background: "#FDFAF6" }}>
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          badge="The problem"
          title={
            <>
              {/* Kept on one line from sm up so the headline breaks before the olive
                  phrase, as it does in the design, instead of after "scattered". */}
              Your wedding memories are{" "}
              <span className="sm:whitespace-nowrap" style={{ color: "#556B2F" }}>
                scattered everywhere
              </span>
            </>
          }
          subtitle="Guests take hundreds of amazing photos—but most never reach the couple. They stay buried in phones, disappear into group chats, or get lost forever."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Before */}
          <motion.div
            style={{ ...CARD, background: "linear-gradient(135deg, #FFF5F5 0%, #FFEEE8 100%)", border: "1.36px solid #FFE2E2" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-center" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#C0392B", lineHeight: "20px" }}>
              Before Momento App
            </p>
            <h3 className="text-center mt-1" style={{ fontSize: "1.5rem", fontWeight: 500, color: "#1A1A1A", lineHeight: "36px" }}>
              Memories Lost in the Chaos
            </h3>

            <ul className="mt-6 flex flex-col gap-3">
              {SCATTERED.map((s) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.label}
                    className="flex items-center gap-3 bg-white"
                    style={{ borderRadius: 16, padding: 14, border: "1.36px solid #FEF2F2", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                  >
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 40, height: 40, borderRadius: 14, background: `${s.color}18` }}
                    >
                      <Icon size={18} color={s.color} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "20px" }}>
                        {s.label}
                      </span>
                      <span className="block" style={{ fontSize: "0.75rem", color: "#999", lineHeight: "16px" }}>
                        {s.note}
                      </span>
                    </span>
                    <span
                      className="flex items-center justify-center shrink-0 rounded-full"
                      style={{ width: 24, height: 24, background: "#FEF2F2", color: "#FF6467", fontSize: "0.75rem", lineHeight: "16px" }}
                      aria-hidden
                    >
                      ✕
                    </span>
                  </li>
                );
              })}
            </ul>

            <p
              className="mt-5 text-center"
              style={{ ...PILL, background: "#FEF2F2", border: "1.36px solid #FFE2E2", color: "#C0392B" }}
            >
              Most memories never reach the couple 💔
            </p>
          </motion.div>

          {/* After */}
          <motion.div
            style={{
              ...CARD,
              background: "linear-gradient(135deg, rgba(247,231,206,0.4) 0%, rgba(232,240,216,0.4) 100%)",
              border: "1.36px solid #E8D4AE",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          >
            <p className="text-center" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#556B2F", lineHeight: "20px" }}>
              With Momento App
            </p>
            <h3 className="text-center mt-1" style={{ fontSize: "1.5rem", fontWeight: 500, color: "#1A1A1A", lineHeight: "36px" }}>
              One Beautiful Album
            </h3>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {ALBUM.map((photo) => (
                <div key={photo.src} className="relative" style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden" }}>
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 1024px) 30vw, 165px" />
                </div>
              ))}
            </div>

            <ul className="mt-7 flex flex-col gap-2.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5">
                  <CheckCircle size={16} color="#556B2F" weight="regular" className="shrink-0" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#3A3A3A", lineHeight: "20px" }}>{b}</span>
                </li>
              ))}
            </ul>

            <p
              className="mt-5 text-center"
              style={{ ...PILL, background: "rgba(85,107,47,0.1)", border: "1.36px solid rgba(85,107,47,0.2)", color: "#556B2F" }}
            >
              Every memory, safely collected 💚
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
