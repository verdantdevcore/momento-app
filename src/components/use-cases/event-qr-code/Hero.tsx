"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { QrCode, ArrowRight, Play, UploadSimple, Images } from "@phosphor-icons/react";

const FLOATING_CARDS = [
  {
    icon: <QrCode size={24} weight="regular" color="#556B2F" />,
    iconBg: "rgba(85,107,47,0.1)",
    title: "QR Scan",
    sub: "No app needed",
    subColor: "#888",
    // Design places these at fixed offsets around a 576x432 image; percentages
    // keep them anchored once the image starts scaling below 1439px.
    style: { top: "7%", left: "-4%" },
  },
  {
    icon: <UploadSimple size={20} weight="regular" color="#00A63E" />,
    iconBg: "#F0FDF4",
    title: "247 uploads",
    sub: "Live syncing…",
    subColor: "#00A63E",
    style: { top: "72%", left: "76%" },
  },
  {
    icon: <Images size={20} weight="regular" color="#556B2F" />,
    iconBg: "#F7E7CE",
    title: "Shared Album",
    sub: "Annual Conference 2025",
    subColor: "#888",
    style: { top: "90%", left: "6%" },
  },
];

function FloatingCard({ card, index }: { card: (typeof FLOATING_CARDS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 + index * 0.15, ease: "easeOut" }}
      className="absolute hidden sm:flex items-center gap-3 bg-white rounded-2xl p-3 md:p-4"
      style={{ ...card.style, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
    >
      <div
        className="flex items-center justify-center rounded-[14px] shrink-0"
        style={{ background: card.iconBg, width: index === 0 ? 48 : 40, height: index === 0 ? 48 : 40 }}
      >
        {card.icon}
      </div>
      <div className="min-w-0">
        <p className="whitespace-nowrap" style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1A1A1A", lineHeight: "19.5px" }}>
          {card.title}
        </p>
        <p className="whitespace-nowrap" style={{ fontWeight: 500, fontSize: "0.6875rem", color: card.subColor, lineHeight: "16.5px" }}>
          {card.sub}
        </p>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(149deg, #F9F7F3 0%, #F0EDE4 40%, #E8F0D8 100%)" }}
    >
      {/* Soft radial blooms, mirroring the two blurred circles in the design */}
      <div
        className="absolute rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "#556B2F", width: 384, height: 384, top: -160, right: -60 }}
      />
      <div
        className="absolute rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "#556B2F", width: 320, height: 320, bottom: -80, left: -80 }}
      />

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 lg:gap-16 items-center pt-32 pb-16 md:pt-36 md:pb-24">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{ background: "rgba(85,107,47,0.1)", border: "1.36px solid rgba(85,107,47,0.2)", padding: "9px 17px" }}
          >
            <QrCode size={16} weight="regular" color="#556B2F" />
            <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#556B2F" }}>
              Event QR Code Photo Upload
            </span>
          </div>

          {/* Type is set inline because globals.css carries unlayered h1..h5 rules,
              which beat Tailwind's layered text utilities. Design specifies 68px
              at 1439px; clamp scales it down rather than stepping at breakpoints. */}
          <h1
            className="mt-6"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)", fontWeight: 800, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "-0.01em" }}
          >
            One QR Code. <span style={{ color: "#556B2F" }}>Every Event</span> Memory.
          </h1>

          <p className="mt-8 max-w-lg" style={{ fontSize: "1.125rem", color: "#5A5A5A", lineHeight: "29.25px" }}>
            Let every attendee contribute photos and videos instantly. Guests simply scan a QR code,
            upload from their browser, and every memory is organized into one beautiful shared album.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "#556B2F", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "16px 28px", textDecoration: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" }}
            >
              Create Your Event Album
              <ArrowRight size={16} weight="bold" />
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl cursor-pointer transition-all hover:opacity-90"
              style={{ background: "#fff", border: "1.36px solid #E5E7EB", padding: "17px 29px" }}
            >
              <span className="flex items-center justify-center rounded-full" style={{ background: "#556B2F", width: 32, height: 32 }}>
                <Play size={14} weight="fill" color="#fff" style={{ marginLeft: 2 }} />
              </span>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "#1A1A1A" }}>Watch Demo</span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{ width: 32, height: 32, border: "1.36px solid #fff", background: "#DCD9CE", marginLeft: i === 0 ? 0 : -8 }}
                />
              ))}
            </div>
            <p style={{ fontSize: "0.875rem", color: "#5A5A5A", fontWeight: 500 }}>
              <span style={{ fontWeight: 700, color: "#556B2F" }}>50,000+</span> events powered by Momento App
            </p>
          </div>
        </motion.div>

        {/* Image with floating stat cards */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "4/3", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <Image
              src="/use-cases/event-qr-hero.jpg"
              alt="Event guests uploading photos from their phones"
              fill
              priority
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(85,107,47,0.3) 0%, rgba(0,0,0,0) 60%)" }}
            />
          </div>

          {FLOATING_CARDS.map((card, i) => (
            <FloatingCard key={card.title} card={card} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
