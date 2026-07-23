"use client";

import { motion } from "motion/react";

/**
 * The badge + title + subtitle stack that opens most sections of the design.
 * Type is set inline throughout: globals.css declares unlayered h1..h5 rules
 * that would otherwise beat any Tailwind text utility applied here.
 */
export function SectionHeading({
  badge,
  title,
  subtitle,
  badgeBg = "#F7E7CE",
  badgeColor = "#556B2F",
}: {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  badgeBg?: string;
  badgeColor?: string;
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ background: badgeBg, color: badgeColor, fontSize: "0.875rem", fontWeight: 600, lineHeight: "20px", padding: "5px 16px" }}
      >
        {badge}
      </span>

      {/* Figma section titles: 48px Urbanist SemiBold, line-height 55.2 (1.15),
          letter-spacing 0. Widest single-line title in the design is 864px
          ("Built for the perfect wedding experience"), so cap at 896 and let
          longer titles wrap. */}
      <h2
        className="mt-4"
        style={{ maxWidth: 896, fontSize: "clamp(1.875rem, 3.4vw, 3rem)", fontWeight: 600, color: "#1A1A1A", lineHeight: 1.15, letterSpacing: 0 }}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4" style={{ maxWidth: 576, fontSize: "1.05rem", fontWeight: 400, color: "#6B6B6B", lineHeight: "27.3px" }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
