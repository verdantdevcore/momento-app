"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, QrCode } from "@phosphor-icons/react";

const REASSURANCE = ["No app download needed", "Works on any phone", "Set up in 2 minutes", "Cancel anytime"];

export function FinalCta() {
  return (
    <section id="pricing" className="relative overflow-hidden" style={{ padding: "120px 24px" }}>
      <Image src="/use-cases/wedding/gal-tent-reception.jpg" alt="" fill className="object-cover" sizes="100vw" aria-hidden />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(28,35,15,0.88) 0%, rgba(45,58,28,0.82) 50%, rgba(20,25,10,0.9) 100%)" }} />

      <div className="absolute rounded-full" style={{ top: -40, left: -40, width: 300, height: 300, background: "radial-gradient(circle, rgba(122,150,64,0.15) 0%, transparent 70%)" }} aria-hidden />
      <div className="absolute rounded-full" style={{ bottom: -60, right: -40, width: 400, height: 400, background: "radial-gradient(circle, rgba(247,231,206,0.08) 0%, transparent 70%)" }} aria-hidden />
      <div className="absolute" style={{ top: 20, right: "15%", fontSize: 60, opacity: 0.1 }} aria-hidden>🌿</div>
      <div className="absolute" style={{ bottom: 30, left: "10%", fontSize: 50, opacity: 0.08 }} aria-hidden>🌸</div>

      <div className="relative mx-auto text-center" style={{ maxWidth: 900, zIndex: 1 }}>
        <motion.div
          className="inline-flex items-center gap-2 rounded-full"
          style={{ background: "rgba(247,231,206,0.15)", border: "1px solid rgba(247,231,206,0.25)", padding: "8px 20px", marginBottom: 36 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <QrCode size={14} color="#F7E7CE" />
          <span style={{ fontSize: 13, color: "#F7E7CE", fontWeight: 600, letterSpacing: 1 }}>Start free — no credit card required</span>
        </motion.div>

        <motion.h2
          style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 28 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Let Every Guest Help<br />
          <span style={{ color: "#F7E7CE", fontStyle: "italic" }}>Tell Your Wedding Story</span>
        </motion.h2>

        <motion.p
          style={{ fontSize: 20, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 48px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          One elegant QR code is all it takes to collect every unforgettable wedding memory in one beautiful album.
        </motion.p>

        <motion.div
          className="flex justify-center flex-wrap"
          style={{ gap: 16 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #F7E7CE, #f0d5b0)", color: "#2d3a1c", padding: "18px 40px", borderRadius: 50, fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(247,231,206,0.25)" }}
            >
              Generate Your Wedding QR Code <ArrowRight size={18} weight="bold" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Link
              href="#qr-packs"
              className="inline-flex items-center gap-2"
              style={{ background: "transparent", color: "rgba(255,255,255,0.9)", padding: "18px 36px", borderRadius: 50, fontSize: 17, fontWeight: 600, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              Browse Wedding QR Packs
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center flex-wrap"
          style={{ gap: 32, marginTop: 48 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {REASSURANCE.map((item) => (
            <div key={item} className="flex items-center" style={{ gap: 8, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#7a9640" }} />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
