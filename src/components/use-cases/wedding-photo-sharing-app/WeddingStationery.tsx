"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { QrCode } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const TEMPLATES = [
  {
    title: "Welcome Sign",
    size: '24" × 36"',
    body: "Large format welcome sign with your QR code for the venue entrance.",
    photo: "/use-cases/wedding/gal-tablescape.jpg",
    alt: "Reception table setting",
    previewBg: "#F7E7CE",
  },
  {
    title: "Reception Poster",
    size: 'A3 / 11" × 17"',
    body: "Elegant A3 poster for the reception hall directing guests to share photos.",
    photo: "/use-cases/wedding/gal-head-table.jpg",
    alt: "Head table florals",
    previewBg: "#E8F0D8",
  },
  {
    title: "Table Card",
    size: '4" × 6"',
    body: 'Minimalist 4" × 6" table tent cards for every dinner table.',
    photo: "/use-cases/wedding/album-tablescape.jpg",
    alt: "Candlelit dinner table",
    previewBg: "#F7E7CE",
  },
  {
    title: "QR Coaster Card",
    size: '3.5" × 3.5"',
    body: "Beautiful circular QR coaster cards for cocktail tables.",
    photo: "/use-cases/wedding/gal-flatlay.jpg",
    alt: "Flowers on a reception table",
    previewBg: "#E8F0D8",
  },
  {
    title: "Menu Insert",
    size: '3" × 8"',
    body: "Slim insert card that fits inside printed menus elegantly.",
    photo: "/use-cases/wedding/album-cake.jpg",
    alt: "Wedding cake display",
    previewBg: "#E8F0D8",
  },
];

// The mock template that sits on every card photo. Same artwork at every size,
// which is the point the section is making — one code, every piece of stationery.
function TemplatePreview({ background }: { background: string }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ width: 152, padding: 14, borderRadius: 12, background, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
    >
      <p style={{ fontSize: "0.5rem", fontWeight: 700, color: "#556B2F", letterSpacing: "1px", lineHeight: "12px" }}>
        EMMA &amp; JAMES
      </p>
      <p
        className="mt-1"
        style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "0.6875rem", color: "#1A1A1A", lineHeight: "15px" }}
      >
        Share Your Photos
      </p>
      <span className="flex items-center justify-center bg-white mt-2" style={{ width: 44, height: 44, borderRadius: 8 }}>
        <QrCode size={30} color="#1A1A1A" />
      </span>
      <p className="mt-2" style={{ fontSize: "0.4375rem", color: "#8A8A8A", lineHeight: "10px" }}>
        momento.app/emma-james
      </p>
    </div>
  );
}

export function WeddingStationery() {
  return (
    <section className="py-28 bg-white">
      <div className="site-container">
        <SectionHeading
          badge="Print-Ready templates"
          title={
            <>
              Beautiful <span style={{ color: "#556B2F" }}>wedding stationery</span>
            </>
          }
          subtitle="Download elegant, print-ready templates for every piece of your wedding stationery — all pre-loaded with your custom QR code."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t, i) => (
            <motion.div
              key={t.title}
              className="overflow-hidden bg-white"
              style={{ borderRadius: 20, border: "1.36px solid #EFE7DB" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
            >
              <div className="relative flex items-center justify-center" style={{ aspectRatio: "388/208" }}>
                <Image src={t.photo} alt={t.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 388px" />
                <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.15)" }} />
                <div className="relative">
                  <TemplatePreview background={t.previewBg} />
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "24px" }}>{t.title}</h3>
                  <span
                    className="shrink-0 rounded-full"
                    style={{ background: "#F7E7CE", color: "#7A6533", fontSize: "0.6875rem", fontWeight: 500, lineHeight: "16px", padding: "4px 10px" }}
                  >
                    {t.size}
                  </span>
                </div>
                <p className="mt-2" style={{ fontSize: "0.875rem", color: "#6B6B6B", lineHeight: "22.4px" }}>
                  {t.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center" style={{ fontSize: "0.875rem", color: "#8A8A8A", lineHeight: "22.4px" }}>
          All templates included free with every wedding album. Download as PDF, PNG, or SVG.
        </p>
      </div>
    </section>
  );
}
