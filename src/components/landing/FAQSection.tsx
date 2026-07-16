"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

const FAQS = [
  {
    q: "What is Momento App?",
    a: "Momento App makes it easy for hosts and guests to instantly capture, share, and relive memorable photos and videos from every special event — privately and effortlessly.",
  },
  {
    q: "How does Momento App work?",
    a: "Hosts create a private event album and invite guests using a simple link or QR code. Guests can instantly upload photos and videos during or after the event, making it easy for everyone to enjoy every perspective.",
  },
  {
    q: "How quickly can guests start sharing memories?",
    a: "Guests can join an event and begin uploading photos and videos instantly using a simple link or QR code.",
  },
  {
    q: "Are my uploads safe and where are they stored?",
    a: "Yes. Every event album is securely uploaded and protected using trusted, industry-leading cloud storage and content delivery providers, including Cloudinary and Amazon Web Services S3. All data is encrypted in transit using TLS/SSL encryption and encrypted at rest using AES-256 encryption standards, helping ensure your photos and videos remain private, secure, and protected at all times.",
  },
  {
    q: "Do guests need to create an account?",
    a: "No complicated setup or app download required. Guests can join an event and start sharing memories in seconds.",
  },
  {
    q: "Is Momento App private?",
    a: "Yes. Every event album is private and accessible only to invited guests and hosts.",
  },
  {
    q: "What kinds of events can I use Momento App for?",
    a: "Momento App is perfect for weddings, birthdays, baby showers, graduations, family gatherings, corporate events, conferences, school events, parties and celebrations.",
  },
  {
    q: "Can guests upload both photos and videos?",
    a: "Yes. Guests can contribute both photos and videos to the shared event album.",
  },
  {
    q: "Can I download all event photos afterward?",
    a: "Yes. Hosts can easily access and download event memories after the celebration.",
  },
  {
    q: "Why use Momento App instead of group chats or social media?",
    a: "Group chats get messy, and social media isn't private or organized for events. Momento App keeps every memory in one dedicated shared album designed specifically for events.",
  },
];

function FAQItem({ item, index }: { item: (typeof FAQS)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: open ? "1.5px solid rgba(85,107,47,0.25)" : "1.5px solid rgba(0,0,0,0.06)",
        background: open ? "#f3f7ee" : "#fff",
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-transparent border-none cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <p style={{ fontWeight: 700, fontSize: "0.98rem", color: "#1a1a1a", lineHeight: 1.4 }}>
          {item.q}
        </p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <CaretDown size={18} color="#556B2F" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <p className="px-6 pb-5" style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faqs" className="py-24 px-6" style={{ background: "linear-gradient(160deg, #f9f5ef 0%, #fff 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4"
            style={{ background: "#F7E7CE", color: "#556B2F", fontWeight: 600 }}
          >
            Got questions?
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2 }}>
            Frequently asked questions
          </h2>
        </motion.div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => <FAQItem key={faq.q} item={faq} index={i} />)}
        </div>
      </div>
    </section>
  );
}
