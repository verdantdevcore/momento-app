"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

function FourGlyph() {
  return (
    <span
      style={{
        fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)",
        fontWeight: 900,
        fontSize: "clamp(6rem, 15vw, 9.5rem)",
        lineHeight: 1,
        color: "#556B2F",
        letterSpacing: "-0.03em",
        display: "block",
        textShadow: "3px 4px 0px rgba(85,107,47,0.1)",
        userSelect: "none",
      }}
    >
      4
    </span>
  );
}

function CameraCharacter() {
  return (
    <svg
      viewBox="0 0 88 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "clamp(56px, 11vw, 84px)", height: "clamp(64px, 12.5vw, 96px)", flexShrink: 0 }}
      aria-hidden="true"
    >
      <ellipse cx="44" cy="72" rx="36" ry="14" fill="#F7E7CE" opacity="0.7" />
      <rect x="6" y="28" width="76" height="54" rx="10" fill="white" stroke="#556B2F" strokeWidth="2.5" />
      <rect x="26" y="17" width="26" height="14" rx="5" fill="white" stroke="#556B2F" strokeWidth="2.5" />
      <circle cx="44" cy="55" r="19" fill="#F7E7CE" stroke="#556B2F" strokeWidth="2.5" />
      <circle cx="44" cy="55" r="12" fill="white" stroke="#556B2F" strokeWidth="2" />
      <path d="M37 48.5 Q39.5 47 42 48.5" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M46 48.5 Q48.5 47 51 48.5" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="39.5" cy="52" r="2" fill="#556B2F" />
      <circle cx="48.5" cy="52" r="2" fill="#556B2F" />
      <path d="M39 60.5 Q44 57 49 60.5" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="62" y="35" width="12" height="8" rx="3" fill="#F7E7CE" stroke="#556B2F" strokeWidth="1.5" />
      <circle cx="18" cy="40" r="5" fill="#F7E7CE" stroke="#556B2F" strokeWidth="1.5" />
      <ellipse cx="51" cy="57" rx="1.5" ry="2" fill="#556B2F" opacity="0.2" />
    </svg>
  );
}

function DecorPolaroid({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
      <rect x="1" y="1" width="34" height="40" rx="4" fill="white" stroke="#556B2F" strokeWidth="1.5" />
      <rect x="5" y="5" width="26" height="22" rx="2" fill="#F7E7CE" opacity="0.7" />
    </svg>
  );
}

function DecorStar({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
      <path
        d="M14 2 L16.2 9.6 L24 9.6 L17.9 14.4 L20.1 22 L14 17.2 L7.9 22 L10.1 14.4 L4 9.6 L11.8 9.6 Z"
        stroke="#556B2F" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.45"
      />
    </svg>
  );
}

function DecorCircle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="#556B2F" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export function NotFoundContent() {
  return (
    <div style={{ fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)" }}>
      <Navbar solid />

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #f9f5ef 0%, #fff 55%, #f3f7ee 100%)",
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        {/* Illustration zone */}
        <div style={{ position: "relative", marginBottom: "3.5rem" }}>

          <motion.div
            style={{ position: "absolute", top: "-10px", left: "-10px", zIndex: 1 }}
            animate={{ y: [0, -8, 0], rotate: [-15, -18, -15] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <DecorPolaroid />
          </motion.div>

          <motion.div
            style={{ position: "absolute", top: "-16px", right: "-8px", zIndex: 1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
          >
            <DecorStar />
          </motion.div>

          <motion.div
            style={{ position: "absolute", bottom: "16px", left: "-24px", zIndex: 1 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
          >
            <DecorCircle />
          </motion.div>

          <motion.div
            style={{ position: "absolute", bottom: "8px", right: "-20px", zIndex: 1 }}
            animate={{ y: [0, 6, 0], rotate: [12, 16, 12] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.3 }}
          >
            <DecorPolaroid style={{ width: 28, height: 32 }} />
          </motion.div>

          {/* Scattered dots */}
          <div style={{ position: "absolute", top: 20, right: 28, width: 5, height: 5, borderRadius: "50%", background: "#556B2F", opacity: 0.2 }} />
          <div style={{ position: "absolute", top: 60, left: -36, width: 4, height: 4, borderRadius: "50%", background: "#556B2F", opacity: 0.15 }} />
          <div style={{ position: "absolute", bottom: 30, right: -30, width: 6, height: 6, borderRadius: "50%", background: "#556B2F", opacity: 0.18 }} />

          {/* 404 + camera — gently bobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [20, 0, -8, 0] }}
            transition={{ duration: 0.7, ease: "easeOut", times: [0, 0.5, 0.75, 1], repeat: Infinity, repeatDelay: 4.3 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(6px, 2.5vw, 20px)",
              padding: "32px 40px 24px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <FourGlyph />
            <CameraCharacter />
            <FourGlyph />
          </motion.div>

          {/* Soft shadow ellipse */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "55%",
              height: "18px",
              background: "#F7E7CE",
              borderRadius: "50%",
              filter: "blur(10px)",
              opacity: 0.65,
              zIndex: 0,
            }}
          />
        </div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          style={{ maxWidth: "480px", width: "100%" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
              color: "#1a1a1a",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            Sorry, this page could not be found
          </h1>

          <p
            style={{
              fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)",
              fontWeight: 400,
              fontSize: "0.98rem",
              color: "#666",
              lineHeight: 1.75,
              maxWidth: "380px",
              margin: "0 auto 2rem",
            }}
          >
            The page you are looking for may have been moved, removed, or is temporarily unavailable.
          </p>

          <Link
            href="/"
            style={{
              fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "#556B2F",
              color: "#F7E7CE",
              borderRadius: "100px",
              padding: "0.875rem 2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(85,107,47,0.25)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.9";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            Return to Homepage
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
