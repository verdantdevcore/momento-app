"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { BookOpen, QrCode, Printer, Scan, Image as ImageIcon } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const STEPS = [
  {
    icon: BookOpen,
    tileBg: "#F7E7CE",
    title: "Create an Album",
    body: "Sign up and create your personalized wedding album with your names and date.",
  },
  {
    icon: QrCode,
    tileBg: "#E8F0D8",
    title: "Get Your QR Code",
    body: "Get your unique QR code instantly, ready to be placed on any stationery.",
  },
  {
    icon: Printer,
    tileBg: "#F7E7CE",
    title: "Print Your QR Signs",
    body: "Download print-ready files for table cards, welcome signs, and menus.",
  },
  {
    icon: Scan,
    tileBg: "#E8F0D8",
    title: "Guests Scan",
    body: "Guests point their phone camera at the code — no app needed, just a web browser.",
  },
  {
    icon: ImageIcon,
    tileBg: "#F7E7CE",
    title: "Photos Appear Instantly",
    body: "Every photo uploads in real-time to your private shared event album",
  },
];

const STRIP = [
  { src: "/use-cases/wedding/gal-ceremony.jpg", alt: "Ceremony under chandeliers" },
  { src: "/use-cases/wedding/gal-tablescape.jpg", alt: "Long reception table" },
  { src: "/use-cases/wedding/album-couple.jpg", alt: "Bride and groom portrait" },
  { src: "/use-cases/wedding/gal-sunset-dance.jpg", alt: "Couple dancing at sunset" },
  { src: "/use-cases/wedding/album-bouquet.jpg", alt: "Bridal bouquet" },
];

export function HowItWorks() {
  return (
    <section className="py-28" style={{ background: "#FDFAF6" }}>
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Simple process"
          title={
            <>
              Up and running in <span style={{ color: "#556B2F" }}>60 seconds</span>
            </>
          }
          subtitle="Momento App is designed for couples and event planners. Set up your wedding album before your next coffee break."
        />

        <div className="relative mt-16">
          {/* The rail the five tiles sit on. Sits at tile mid-height and is inset so
              it starts and ends under the first and last tile, never in open space. */}
          <span
            className="hidden lg:block absolute pointer-events-none"
            style={{ top: 38, left: "10%", right: "10%", height: 1, background: "#E8DFD2" }}
          />

          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
                >
                  <span className="relative">
                    <span
                      className="flex items-center justify-center"
                      style={{ width: 76, height: 76, borderRadius: 20, background: s.tileBg }}
                    >
                      <Icon size={28} color="#556B2F" />
                    </span>
                    <span
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        width: 26,
                        height: 26,
                        top: -8,
                        right: -8,
                        background: "#556B2F",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "2px solid #FDFAF6",
                      }}
                    >
                      {i + 1}
                    </span>
                  </span>

                  <h3 className="mt-5" style={{ fontSize: "1rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "24px" }}>
                    {s.title}
                  </h3>
                  <p className="mt-2" style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "22.4px" }}>
                    {s.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STRIP.map((photo, i) => (
            <motion.div
              key={photo.src}
              className={`relative overflow-hidden ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
              style={{ aspectRatio: "230/180", borderRadius: 16 }}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            >
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 1024px) 45vw, 230px" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
