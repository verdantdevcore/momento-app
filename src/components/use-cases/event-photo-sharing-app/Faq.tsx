"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const FAQS = [
  { q: "Can I use Momento App for conferences and large-scale events?", a: "Absolutely. Momento App was built to scale. Whether you have 50 or 5,000 attendees, our infrastructure handles unlimited concurrent uploads without slowdowns. Conferences are one of our most popular use cases." },
  { q: "Does Momento App work for corporate events?", a: "Yes — and it's used by companies ranging from startups to Fortune 500 corporations. You can create private, branded albums for team-building events, product launches, retreats, and company milestones." },
  { q: "Can attendees upload videos, not just photos?", a: "Yes. Guests can upload both photos and short video clips directly from their smartphone browser. All media is stored in full quality with no compression." },
  { q: "Can I customize the QR code with my event branding?", a: "On our Pro and Business plans, you can customize QR codes with your event logo, colors, and branding. Your album URL can also be customized to match your event name." },
  { q: "How many guests can upload at the same time?", a: "There is no limit on the number of simultaneous uploaders. Hundreds of guests can upload at the same time without any service degradation. We use enterprise-grade cloud infrastructure to ensure reliability." },
  { q: "Can organizers moderate or approve uploads before they appear?", a: "Yes. You can enable moderation mode, where all uploads require your approval before appearing in the public album. You can also delete individual photos, flag content, and manage your album in real time." },
  { q: "Can multiple organizers manage the same event?", a: "Yes. You can invite co-organizers and team members to collaborate on event management. Permissions can be set to view-only, moderator, or full-admin levels." },
  { q: "How secure are event albums?", a: "All event albums are private by default and only accessible via your unique QR code link. Albums are hosted on encrypted, enterprise-grade cloud servers. You can also add an additional password layer for extra security." },
  { q: "Can guests upload photos after the event is over?", a: "Yes. You control how long the upload window stays open. You can allow uploads for days or weeks after the event, giving guests time to share photos they may have missed uploading on the day." },
  { q: "Can I download the entire album as a ZIP file?", a: "Yes. As the event organizer, you can download all content — including every guest's photos and videos — in a single ZIP file. Downloads are available on all paid plans." },
  { q: "Do guests need to create an account or log in?", a: "No. Guests simply scan the QR code, select their photos, and upload. No account creation, no passwords, no app downloads. The experience is frictionless by design." },
  { q: "What file formats does Momento App support?", a: "Momento App supports all standard photo formats including JPEG, PNG, HEIC, and WebP, as well as common video formats including MP4 and MOV. Files are stored in their original format." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  // No bottom padding: in the design the FinalCTA sits flush against the
  // "Still have questions?" card (frame 2:10872 is parked at the FAQ's bottom
  // edge), so there is no white gap below this section.
  return (
    <section id="faqs" style={{ background: "#fff", padding: "96px 24px 0" }}>
      <div className="mx-auto" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 64 }}>
          <SectionHeader
            badge="FAQ"
            title="Frequently asked questions"
            subtitle="Everything you need to know about Momento App's event photo sharing platform."
          />
        </div>

        <div className="flex flex-col" style={{ gap: "0.75rem" }}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                className="overflow-hidden"
                style={{ border: isOpen ? "1.5px solid #556B2F" : "1.5px solid #eee", borderRadius: 16 }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.04 * i, duration: 0.4 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                  style={{ padding: "20px 24px", background: isOpen ? "#f6faf0" : "#fff", border: "none", cursor: "pointer", gap: 16 }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.4 }}>{faq.q}</span>
                  <span className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: 8, background: isOpen ? "#556B2F" : "#f0f0f0" }}>
                    {isOpen ? <Minus size={16} color="#fff" weight="bold" /> : <Plus size={16} color="#666" weight="bold" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                      <div style={{ padding: "0 24px 24px", background: "#f6faf0" }}>
                        <p style={{ fontSize: 15, color: "#4a4a4a", lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center"
          style={{ marginTop: 48, padding: 32, background: "#f8f5f0", borderRadius: 20, border: "1px solid #eee" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>Still have questions?</p>
          <p style={{ fontSize: 14, color: "#777", marginBottom: 20 }}>Our team typically responds within 2 hours during business hours.</p>
          <Link href="/contact" className="inline-block" style={{ background: "#556B2F", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Contact Support</Link>
        </motion.div>
      </div>
    </section>
  );
}
