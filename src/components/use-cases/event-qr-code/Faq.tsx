"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

/**
 * The Figma frame only specifies the collapsed state, so it supplies the six
 * questions but no answer copy. The answers below are drafted from claims made
 * elsewhere on this page and should be reviewed by marketing before launch.
 */
const FAQS = [
  {
    q: "How do guests upload photos?",
    a: "Guests scan your event QR code with their phone camera, which opens the upload page straight in their browser. They pick photos or videos and upload — the files appear in your shared album immediately.",
  },
  {
    q: "Do guests need to download an app?",
    a: "No. Uploading happens entirely in the browser, so it works on iOS, Android and desktop without an install or an account.",
  },
  {
    q: "Can guests upload videos?",
    a: "Yes. Video clips can be uploaded alongside photos and land in the same shared album.",
  },
  {
    q: "Can I customize the QR code?",
    a: "Yes. You can style your QR code to match your event and print it on welcome signs, table cards, programs, screens or name badges.",
  },
  {
    q: "Is my event album private?",
    a: "Every album is private by default. You control who can view it and who can upload, and nothing is shared publicly unless you choose to share it.",
  },
  {
    q: "Can I download all uploads?",
    a: "Yes. You can export the entire album as a ZIP file at any time, with every photo kept at full resolution.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading badge="FAQ" title="Frequently asked questions" />

        <div className="mt-14 flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="rounded-2xl" style={{ background: "#FAFAF8", border: "1.5px solid #E5E7EB" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 cursor-pointer text-left"
                  style={{ background: "none", border: "none", padding: "20px 24px" }}
                >
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "24px" }}>{item.q}</span>
                  <CaretDown
                    size={20}
                    color="#556B2F"
                    style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{ fontSize: "0.9375rem", color: "#666", lineHeight: "25px", padding: "0 24px 20px" }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
