"use client";

import { motion } from "motion/react";

/**
 * Badge + title + subtitle stack for the QR Code Wedding Photo Sharing page
 * (Figma frame 2:6564).
 *
 * Verified against the frame: cream #F7E7CE pill (14px Urbanist SemiBold #556B2F,
 * padding 5/16, fully rounded), title in Urbanist Bold 52px / line-height 1.2 /
 * letter-spacing -0.5 in dark olive #2d3a1c, sentence case. This page's title is
 * larger and darker-olive than the shared use-cases SectionHeading (600/48px/
 * #1A1A1A), so it lives here. Green italic accent words are passed in via the
 * `title` node. Type is inline because globals.css beats Tailwind text utilities.
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  subtitleMaxWidth = 540,
}: {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  subtitleMaxWidth?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ background: "#F7E7CE", color: "#556B2F", fontSize: "0.875rem", fontWeight: 600, lineHeight: "20px", padding: "5px 16px" }}
      >
        {badge}
      </span>

      <h2
        className="mt-3"
        style={{ maxWidth: 720, fontSize: "clamp(2rem, 4.2vw, 3.25rem)", fontWeight: 700, color: "#2d3a1c", lineHeight: 1.2, letterSpacing: "-0.5px" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-5"
          style={{ maxWidth: subtitleMaxWidth, fontSize: "1.125rem", fontWeight: 400, color: "#6b7280", lineHeight: 1.7 }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/** Green italic accent used on a title's emphasised line. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#556B2F", fontStyle: "italic" }}>{children}</span>;
}
