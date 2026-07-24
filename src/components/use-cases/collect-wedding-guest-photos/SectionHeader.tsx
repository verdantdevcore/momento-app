"use client";

import { motion } from "motion/react";

/**
 * Badge + title + subtitle stack for the Collect Wedding Guest Photos page
 * (Figma frame 2:10989).
 *
 * Verified against the frame: cream #F7E7CE pill (14px SemiBold #556B2F, fully
 * rounded), title in near-black olive #1A2410, Urbanist Bold ~700, and — unlike
 * the QR page — every section title is SENTENCE case here (e.g. "Hundreds of
 * eyes. One wedding day."). Green italic accent words are passed in via `title`.
 * Type is set inline because globals.css beats Tailwind text utilities.
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  subtitleMaxWidth = 560,
  titleMaxWidth = 720,
}: {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  subtitleMaxWidth?: number;
  titleMaxWidth?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ background: "#F7E7CE", color: "#556B2F", fontSize: "0.875rem", fontWeight: 600, lineHeight: "20px", padding: "6px 18px" }}
      >
        {badge}
      </span>

      <h2
        className="mt-5"
        style={{ maxWidth: titleMaxWidth, fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 700, color: "#1A2410", lineHeight: 1.2, letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-4"
          style={{ maxWidth: subtitleMaxWidth, fontSize: "1.05rem", fontWeight: 400, color: "#5A5A5A", lineHeight: 1.65 }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/** Green italic accent used on an emphasised span in a title. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#556B2F", fontStyle: "italic" }}>{children}</span>;
}
