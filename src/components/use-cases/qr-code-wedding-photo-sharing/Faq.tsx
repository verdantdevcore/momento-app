"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const FAQS = [
  { q: "How does the wedding QR code work?", a: "When guests point their smartphone camera at your Momento App QR code, it instantly opens a beautiful, branded upload page in their browser. They can select photos and videos from their camera roll and upload them directly to your private album — all without downloading any app." },
  { q: "Do guests need to download an app to upload photos?", a: "No — and that's one of the biggest advantages. Momento App works entirely in the browser. Any smartphone (iPhone, Android, or other) with a camera can scan the QR code and upload photos without installing anything. Zero friction for your guests." },
  { q: "Can guests upload videos as well as photos?", a: "Yes. Guests can upload both photos and videos in full quality. There's no compression — the files arrive in your album exactly as they were captured on the guest's device." },
  { q: "Can wedding photographers upload RAW image files?", a: "Absolutely. Momento App supports RAW files alongside JPEG, PNG, HEIC, and all common video formats. Photographers can upload their full-resolution RAW files directly, making it easy to consolidate professional and guest photos in one place." },
  { q: "Can I print multiple QR code signs for different locations?", a: "Yes — and we encourage it. All QR signs for your wedding link to the same album, so guests can scan from anywhere in the venue. Our Print Collection includes 8+ template designs in multiple sizes so you can display your QR code at every key location." },
  { q: "Can guests upload photos after the wedding?", a: "Yes. Your Momento App album stays active for as long as you choose. You can keep it open for days or weeks after the wedding so guests who want to upload photos later can do so at their leisure." },
  { q: "Can I customise the design of my wedding QR code?", a: "Yes. Your QR code can be styled to match your wedding aesthetic — colours, shapes, and your names or wedding date can be incorporated into the design. Our Wedding QR Pack templates are professionally designed and fully personalised." },
  { q: "Is my wedding album private?", a: "Your album is completely private by default. Only people with the QR code link can access it, and you can add an additional PIN code for extra security. Nothing is publicly indexed or visible to anyone outside your wedding." },
  { q: "Can I download the entire wedding album in one go?", a: "Yes. You can download your complete album as a single ZIP file with one click. All photos and videos are included at full resolution, organised chronologically and by uploader." },
  { q: "Does Momento App work for international weddings?", a: "Momento App works in 150+ countries and supports all major mobile networks. There are no regional restrictions — guests from anywhere in the world can scan and upload without any limitations. Your QR code works globally." },
  { q: "How many photos can guests upload?", a: "There is no limit. Unlimited photos and videos can be uploaded to your album. We believe every moment deserves to be captured, so we've removed all caps on uploads for wedding accounts." },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" style={{ background: "linear-gradient(160deg, #f9fdf5 0%, #fefef9 100%)", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="FAQ"
            title={<>Everything you need to know<br />about wedding QR photo sharing</>}
            subtitle="Have a question? We probably have the answer below."
            subtitleMaxWidth={480}
          />
        </div>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="overflow-hidden"
                style={{ background: "#fff", borderRadius: 18, border: `1px solid ${isOpen ? "rgba(85,107,47,0.2)" : "rgba(85,107,47,0.08)"}`, boxShadow: isOpen ? "0 4px 20px rgba(85,107,47,0.08)" : "0 2px 8px rgba(0,0,0,0.04)" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                  style={{ gap: 16, padding: "22px 28px", background: "none", border: "none", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 18, fontWeight: 600, color: isOpen ? "#556B2F" : "#2d3a1c", lineHeight: 1.4 }}>{faq.q}</span>
                  <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 32, height: 32, background: isOpen ? "rgba(85,107,47,0.1)" : "rgba(0,0,0,0.04)" }}>
                    {isOpen ? <Minus size={15} color="#556B2F" weight="bold" /> : <Plus size={15} color="#6b7280" weight="bold" />}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "20px 28px 24px", fontSize: 16, color: "#6b7280", lineHeight: 1.75, borderTop: "1px solid rgba(85,107,47,0.06)" }}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center"
          style={{ marginTop: 48, padding: "36px 32px", background: "#fff", borderRadius: 20, border: "1px solid rgba(85,107,47,0.08)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 16 }}>Still have questions? We&apos;re here to help.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", color: "#fff", padding: "12px 28px", borderRadius: 50, fontSize: 15, fontWeight: 600, textDecoration: "none" }}
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
