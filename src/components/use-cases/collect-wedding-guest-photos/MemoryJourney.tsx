"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Icon } from "@phosphor-icons/react";
import { Camera, Sparkle, SquaresFour, Heart } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const steps: { icon: Icon; step: string; title: string; description: string; image: string; alt: string }[] = [
  {
    icon: Camera,
    step: "01",
    title: "Guests Capture Moments",
    description: "Your guests use their phones to capture authentic, candid moments throughout the entire wedding day — from getting ready to the last dance.",
    image: `${BASE}/journey-step1-capture.jpg`,
    alt: "Wedding guests capturing candid moments at the ceremony",
  },
  {
    icon: Sparkle,
    step: "02",
    title: "Momento App Collects Them",
    description: "Guests scan a QR code or tap a link — no app download required. Photos and videos upload instantly into your private wedding album.",
    image: `${BASE}/journey-step2-collect.jpg`,
    alt: "People at a wedding reception using mobile phones",
  },
  {
    icon: SquaresFour,
    step: "03",
    title: "Everything in One Shared Album",
    description: "Every photo and video from every guest appears in your beautiful shared album — organized by time, face, or moment. Nothing is lost.",
    image: `${BASE}/journey-step3-album.jpg`,
    alt: "Wedding reception with guests sharing moments",
  },
  {
    icon: Heart,
    step: "04",
    title: "Relive Every Memory Together",
    description: "Discover photos you never knew existed. Relive your wedding from every perspective and share your complete album with family forever.",
    image: `${BASE}/journey-step4-relive.jpg`,
    alt: "Happy couple looking at their wedding album together",
  },
];

export function MemoryJourney() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="How it works"
          title="Every memory finds its way home"
          subtitle="Effortless for guests to share. Effortless for you to discover memories you never knew existed."
        />

        <div className="mt-14 flex flex-col gap-14 md:gap-16">
          {steps.map((step, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:gap-12 items-center`}
              >
                <div className="w-full md:w-5/12 shrink-0">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ height: 260 }}>
                    <Image src={step.image} alt={step.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 460px" />
                  </div>
                </div>

                <div className="w-full md:w-7/12">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: "#F7E7CE" }}>
                      <step.icon size={20} className="text-[#556B2F]" />
                    </span>
                    <span className="text-[#556B2F]" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em" }}>STEP {step.step}</span>
                  </div>
                  <h3 className="text-[#1A2410] mb-3" style={{ fontWeight: 700, fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)", lineHeight: 1.25 }}>
                    {step.title}
                  </h3>
                  <p className="text-[#5A5A5A]" style={{ fontSize: "1rem", lineHeight: 1.65 }}>{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
