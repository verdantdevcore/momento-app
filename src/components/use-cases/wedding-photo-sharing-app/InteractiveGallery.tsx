"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeading } from "../shared/SectionHeading";

// A masonry of three independent columns, so each tile keeps the aspect ratio it
// has in the design rather than being forced into a uniform grid cell.
const COLUMNS = [
  [
    { src: "/use-cases/wedding/gal-ceremony.jpg", alt: "Ceremony under chandeliers", ratio: "395/288" },
    { src: "/use-cases/wedding/gal-tablescape.jpg", alt: "Long reception table", ratio: "395/224" },
    { src: "/use-cases/wedding/gal-guests-cheering.jpg", alt: "Guests cheering the couple", ratio: "395/208" },
    { src: "/use-cases/wedding/gal-bridesmaids.jpg", alt: "Bridesmaids laughing together", ratio: "395/192" },
    { src: "/use-cases/wedding/gal-cocktail-hour.jpg", alt: "Guests at cocktail hour", ratio: "395/192" },
  ],
  [
    { src: "/use-cases/wedding/gal-flatlay.jpg", alt: "Bridal flowers flat lay", ratio: "395/192" },
    { src: "/use-cases/wedding/gal-cake.jpg", alt: "Tiered wedding cake", ratio: "395/176" },
    { src: "/use-cases/wedding/gal-head-table.jpg", alt: "Head table florals", ratio: "395/240" },
    { src: "/use-cases/wedding/gal-floral-installation.jpg", alt: "Floral installation at night", ratio: "395/224" },
    { src: "/use-cases/wedding/gal-tent-reception.jpg", alt: "Marquee reception at dusk", ratio: "397/272" },
  ],
  [
    { src: "/use-cases/wedding/gal-sunset-dance.jpg", alt: "Couple dancing at sunset", ratio: "395/256" },
    { src: "/use-cases/wedding/gal-couple-bouquet.jpg", alt: "Bride and groom with bouquet", ratio: "395/320" },
    { src: "/use-cases/wedding/gal-red-bouquet.jpg", alt: "Bouquet of garden roses", ratio: "395/288" },
    { src: "/use-cases/wedding/gal-couple-embrace.jpg", alt: "Couple embracing at golden hour", ratio: "395/256" },
  ],
];

export function InteractiveGallery() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          badge="Every perspective"
          title={
            <>
              See every guest&apos;s <span style={{ color: "#556B2F" }}>perspective</span>
            </>
          }
          subtitle="From the ceremony aisle to the last dance — Momento App collects every candid, every laugh, every tear."
        />

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((column, c) => (
            <div key={c} className={`flex flex-col gap-4 ${c === 2 ? "col-span-2 lg:col-span-1" : ""}`}>
              {column.map((photo, i) => (
                <motion.div
                  key={photo.src}
                  className="relative overflow-hidden group"
                  style={{ aspectRatio: photo.ratio, borderRadius: 16 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 395px"
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
