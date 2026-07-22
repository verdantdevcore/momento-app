"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

/**
 * As on the Event QR Code page, the Figma frame only specifies the collapsed
 * state — it supplies the eight questions but no answer copy. The answers below
 * are drafted from claims made elsewhere on this page and should be reviewed by
 * marketing before launch.
 */
const FAQS = [
  {
    q: "Do guests need to install an app?",
    a: "No. Scanning your QR code opens the upload page straight in the phone's browser, so guests can contribute on iOS, Android or desktop without an install or an account.",
  },
  {
    q: "Can guests upload videos?",
    a: "Yes. Speeches, first dances and toasts can be uploaded as full HD video and land in the same shared album as the photos.",
  },
  {
    q: "Can I download everything after the wedding?",
    a: "Yes. You can export the entire album as a ZIP file at any time, with every photo kept at its original resolution rather than a compressed copy.",
  },
  {
    q: "Can uploads be kept private?",
    a: "Every wedding album is private by default. Only guests with your QR code or link can view and upload, and nothing is shared publicly unless you choose to share it.",
  },
  {
    q: "Does Momento App work internationally?",
    a: "Yes. Guests upload over the web from anywhere, so destination weddings and guests joining from abroad work exactly the same way.",
  },
  {
    q: "Can our wedding photographer upload too?",
    a: "Yes. Your photographer can upload to the same album, so professional shots and guest photos live together in one place.",
  },
  {
    q: "How does the QR code work?",
    a: "You get a unique QR code for your album the moment you create it. Print it on welcome signs, table cards, coasters or menu inserts — pointing a phone camera at it opens your upload page.",
  },
  {
    q: "Is there a guest upload limit?",
    a: "No. There are no storage limits and no cap on how many photos each guest can add.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28" style={{ background: "#FDFAF6" }}>
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading
          badge="Questions & answers"
          title={
            <>
              Frequently asked <span style={{ color: "#556B2F" }}>questions</span>
            </>
          }
        />

        <p className="mt-4 text-center" style={{ fontSize: "1.0625rem", color: "#666", lineHeight: "25.5px" }}>
          Everything you need to know about Momento App. Can&apos;t find your answer?{" "}
          <Link href="/contact" style={{ color: "#556B2F", textDecoration: "underline" }}>
            Contact us
          </Link>
          .
        </p>

        <div className="mt-12 flex flex-col gap-4">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="bg-white" style={{ borderRadius: 16, border: "1.36px solid #EFE7DB" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 cursor-pointer text-left"
                  style={{ background: "none", border: "none", padding: "22px 24px" }}
                >
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#1A1A1A", lineHeight: "24px" }}>{item.q}</span>
                  <span
                    className="flex items-center justify-center shrink-0 rounded-full"
                    style={{
                      width: 30,
                      height: 30,
                      background: "#F7E7CE",
                      transform: isOpen ? "rotate(45deg)" : "none",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    <Plus size={14} weight="bold" color="#556B2F" />
                  </span>
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
                      <p style={{ fontSize: "0.9375rem", color: "#666", lineHeight: "25px", padding: "0 24px 22px" }}>{item.a}</p>
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
