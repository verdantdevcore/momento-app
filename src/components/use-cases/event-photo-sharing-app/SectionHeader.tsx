"use client";

import { motion } from "motion/react";

/**
 * Badge + title + subtitle stack that opens most sections of the Event Photo
 * Sharing App page (Figma frame 2:9245).
 *
 * Verified against the frame: cream #F7E7CE pill (14px Urbanist SemiBold #556B2F,
 * padding 5/16, fully rounded), title in Urbanist Bold 44.8px (=2.8rem) /
 * line-height 1.2 #1A1A1A, subtitle 17px / line-height 1.7 #6B6B6B. Titles are
 * sentence case in the design, not Title Case. This page's title is 700/2.8rem,
 * which differs from the shared use-cases SectionHeading (600/3rem), so it lives
 * here rather than reusing that one. Type is set inline because globals.css has
 * unlayered h2 rules that beat Tailwind text utilities.
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  dark = false,
  subtitleMaxWidth = 560,
}: {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  subtitleMaxWidth?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ background: "#F7E7CE", color: "#556B2F", fontSize: "0.875rem", fontWeight: 600, lineHeight: "20px", padding: "5px 16px" }}
      >
        {badge}
      </span>

      <h2
        className="mt-3"
        style={{ maxWidth: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: dark ? "#FFFFFF" : "#1A1A1A", lineHeight: 1.2, letterSpacing: 0 }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-4"
          style={{ maxWidth: subtitleMaxWidth, fontSize: "1.0625rem", fontWeight: 400, color: dark ? "rgba(255,255,255,0.6)" : "#6B6B6B", lineHeight: "28.9px" }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
