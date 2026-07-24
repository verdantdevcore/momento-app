"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "@phosphor-icons/react";

const faqs = [
  {
    question: "How do guests upload their photos?",
    answer: "Guests scan a unique QR code (on table cards or a sign) or tap a personalized link you share via WhatsApp or text. They're taken directly to an upload page in their browser — no technical knowledge required.",
  },
  {
    question: "Do guests need to create an account?",
    answer: "No. Guests simply tap your unique link or scan the QR code. No app download, no sign-up, no password. Just effortless photo sharing that works for every guest at every age.",
  },
  {
    question: "Can guests upload videos too?",
    answer: "Yes! Guests can upload both photos and videos directly to your Momento album. Videos capture speeches, first dances, and candid moments in motion — all stored in original quality.",
  },
  {
    question: "Can our photographer contribute to the album?",
    answer: "Absolutely. Your photographer receives the same upload link and can contribute their professional photos directly. Many photographers love this — everything lives in one beautiful, organized place.",
  },
  {
    question: "Can I download every photo and video?",
    answer: "Yes — download individual photos, select groups, or your entire album as a ZIP file with one click. All downloads are in full resolution, exactly as guests uploaded them. No compression.",
  },
  {
    question: "Is our wedding album private and secure?",
    answer: "Your Momento album is completely private. Only guests with your unique link or QR code can access and contribute. We use bank-level encryption and will never share or use your images for any other purpose.",
  },
];

function FaqItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      style={{ borderBottom: "1px solid #F0F0EC" }}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-4 py-5 text-left group" aria-expanded={open}>
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0 mt-0.5 transition-all"
          style={{ width: 28, height: 28, background: open ? "#556B2F" : "#F7E7CE" }}
        >
          {open ? <Minus size={15} className="text-white" weight="bold" /> : <Plus size={15} className="text-[#556B2F]" weight="bold" />}
        </span>
        <span
          className="flex-1 transition-colors"
          style={{ fontWeight: 500, fontSize: "1rem", lineHeight: 1.4, color: open ? "#556B2F" : "#1A2410" }}
        >
          {item.question}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-[#5A5A5A]" style={{ padding: "0 0 20px 44px", fontSize: "0.9rem", lineHeight: 1.65 }}>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <span className="inline-flex items-center justify-center rounded-full" style={{ background: "#F7E7CE", color: "#556B2F", fontSize: "0.875rem", fontWeight: 600, padding: "6px 18px" }}>
            FAQ
          </span>
          <h2 className="mt-5" style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.6rem)", color: "#1A2410", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            Common questions
          </h2>
          <p className="text-[#5A5A5A] mt-4" style={{ fontSize: "1rem" }}>
            Have more questions?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:no-underline" style={{ color: "#556B2F" }}>Contact our team</Link>.
          </p>
        </motion.div>

        <div>
          {faqs.map((faq, i) => (
            <FaqItem key={i} item={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
