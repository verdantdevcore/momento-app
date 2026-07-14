"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function FinalCTASection() {
  return (
    <section id="final-cta" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="relative text-center rounded-3xl overflow-hidden px-8 py-16 md:px-16" style={{ background: "#556B2F" }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: "#F7E7CE" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "#F7E7CE" }} />
          <div className="relative z-10">
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F7E7CE", lineHeight: 1.2, marginBottom: "1rem" }}>
              Never Miss a Moment
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: "1.05rem", color: "rgba(247,231,206,0.82)", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
              From weddings to birthdays to corporate events, Momento App makes event memory collection effortless — bringing every guest&apos;s photos and videos into one private shared album everyone can enjoy.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  href="/auth/register"
                  className="px-9 py-4 rounded-full transition-all hover:opacity-90 hover:scale-105"
                  style={{ fontWeight: 700, fontSize: "1rem", background: "#F7E7CE", color: "#556B2F", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", textDecoration: "none" }}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  className="px-9 py-4 rounded-full transition-all hover:opacity-80"
                  style={{ fontWeight: 600, fontSize: "1rem", background: "transparent", color: "#F7E7CE", border: "2px solid rgba(247,231,206,0.5)", textDecoration: "none" }}
                >
                  View Demo
                </Link>
              </div>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6" style={{ fontSize: "0.82rem", color: "rgba(247,231,206,0.55)" }}>
              No app downloads required · Private by default · Set up in under 60 seconds
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
