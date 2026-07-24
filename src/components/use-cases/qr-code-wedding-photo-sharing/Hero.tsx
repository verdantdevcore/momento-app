"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Star, UploadSimple, Camera } from "@phosphor-icons/react";

const COUPLE = "/use-cases/wedding/gal-couple-embrace.jpg";
const VENUE = "/use-cases/wedding/gal-tent-reception.jpg";
const HERO_BG = "/use-cases/wedding/gal-head-table.jpg";

function QrGlyph() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden>
      <rect width="140" height="140" rx="12" fill="white" />
      {[[10, 10], [90, 10], [10, 90]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="40" height="40" rx="4" fill="#556B2F" />
          <rect x={x + 7} y={y + 7} width="26" height="26" rx="2" fill="white" />
          <rect x={x + 12} y={y + 12} width="16" height="16" rx="1" fill="#556B2F" />
        </g>
      ))}
      {[60, 70, 80, 90, 100].map((x, i) =>
        [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].filter((_, j) => (i + j) % 3 !== 0).map((y, j) => (
          <rect key={`d-${i}-${j}`} x={x} y={y} width="6" height="6" rx="1" fill="#556B2F" opacity={0.8} />
        )),
      )}
      {[10, 20, 30, 40].map((x, i) =>
        [60, 70, 80].filter((_, j) => (i + j) % 2 !== 0).map((y, j) => (
          <rect key={`e-${i}-${j}`} x={x} y={y} width="6" height="6" rx="1" fill="#556B2F" opacity={0.8} />
        )),
      )}
    </svg>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{ minHeight: 860, background: "linear-gradient(160deg, #fefef9 0%, #f7f3ec 40%, #f0ede4 100%)", paddingTop: 72 }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.06 }} aria-hidden />
      <div className="absolute rounded-full" style={{ top: -80, right: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(85,107,47,0.08) 0%, transparent 70%)" }} aria-hidden />
      <div className="absolute rounded-full" style={{ bottom: -60, left: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(247,231,206,0.6) 0%, transparent 70%)" }} aria-hidden />

      <div className="relative site-container" style={{ padding: "80px 0", zIndex: 1 }}>
        <div className="grid items-center hero-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 60 }}>
          {/* Copy */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 rounded-full" style={{ background: "rgba(85,107,47,0.1)", padding: "6px 16px", marginBottom: 28 }}>
              <Star size={13} weight="fill" color="#556B2F" />
              <span style={{ fontSize: 13, color: "#556B2F", fontWeight: 600, letterSpacing: 0.3 }}>#1 QR Wedding Photo Sharing App</span>
            </div>

            <h1 style={{ fontSize: "clamp(42px, 5vw, 68px)", lineHeight: 1.1, fontWeight: 800, color: "#2d3a1c", marginBottom: 24, letterSpacing: "-1px" }}>
              One QR Code.<br />
              <span style={{ color: "#556B2F", fontStyle: "italic" }}>Every Wedding</span><br />
              Memory.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: "#6b7280", marginBottom: 40, maxWidth: 480 }}>
              Display one beautifully designed QR code throughout your wedding venue and let every guest instantly upload
              their photos and videos. No app downloads, no complicated setup, and no lost memories.
            </p>

            <div className="flex flex-wrap" style={{ gap: 16 }}>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", color: "#fff", padding: "16px 32px", borderRadius: 50, fontSize: 16, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 24px rgba(85,107,47,0.35)" }}
                >
                  Generate Your Wedding QR Code <ArrowRight size={18} weight="bold" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Link
                  href="#qr-packs"
                  className="inline-flex items-center gap-2"
                  style={{ background: "transparent", color: "#556B2F", padding: "16px 28px", borderRadius: 50, fontSize: 16, fontWeight: 600, textDecoration: "none", border: "2px solid rgba(85,107,47,0.3)" }}
                >
                  Explore QR Wedding Packs
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center" style={{ gap: 16, marginTop: 40 }}>
              <div className="flex">
                {[COUPLE, VENUE, COUPLE].map((src, i) => (
                  <span key={i} className="rounded-full" style={{ width: 36, height: 36, border: "2px solid #fff", marginLeft: i > 0 ? -10 : 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                ))}
              </div>
              <div>
                <div className="flex" style={{ gap: 2 }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} weight="fill" color="#f59e0b" />)}</div>
                <span style={{ fontSize: 13, color: "#6b7280" }}>25,000+ couples trust Momento App</span>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div className="relative flex items-center justify-center hero-visual" style={{ minHeight: 520 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
            {/* Central QR card */}
            <motion.div
              className="relative flex flex-col items-center"
              style={{ background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.15)", gap: 16, zIndex: 3, minWidth: 220 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{ fontSize: 13, color: "#556B2F", letterSpacing: 2, textTransform: "uppercase" }}>Sarah &amp; James</div>
              <QrGlyph />
              <div className="text-center" style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                Scan to share your photos<br />
                <span style={{ color: "#556B2F", fontWeight: 600 }}>momento.app/sarah-james</span>
              </div>
              <div className="absolute" style={{ top: -14, right: -10, fontSize: 28, transform: "rotate(20deg)" }}>🌿</div>
            </motion.div>

            {/* Phone — album */}
            <motion.div className="absolute" style={{ right: -20, bottom: 20, zIndex: 4 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
              <div style={{ width: 160, borderRadius: 24, background: "#1a1a2e", padding: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ borderRadius: 18, overflow: "hidden" }}>
                  <div className="flex items-center justify-center" style={{ height: 14, background: "#1a1a2e" }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "#444" }} />
                  </div>
                  <div style={{ background: "#f8f4f0", minHeight: 200, padding: 10 }}>
                    <div style={{ fontSize: 9, color: "#556B2F", fontWeight: 700, marginBottom: 6 }}>📸 Sarah &amp; James</div>
                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                      {[COUPLE, VENUE, COUPLE, VENUE, COUPLE, VENUE].map((src, i) => (
                        <div key={i} style={{ aspectRatio: "1", borderRadius: 4, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                      ))}
                    </div>
                    <motion.div
                      className="flex items-center"
                      style={{ marginTop: 8, background: "#556B2F", borderRadius: 6, padding: "4px 8px", gap: 4 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      <UploadSimple size={8} color="#fff" />
                      <span style={{ fontSize: 8, color: "#fff" }}>New photo uploaded!</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating photo bubbles */}
            {([{ top: "5%", right: "20%" }, { top: "60%", left: "5%" }, { bottom: "10%", right: "10%" }] as const).map((pos, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ width: 56, height: 56, border: "3px solid #fff", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", backgroundImage: `url(${i % 2 === 0 ? COUPLE : VENUE})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 2, ...pos }}
                animate={{ y: [0, -12, 0], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}

            {/* Upload notification */}
            <motion.div
              className="absolute flex items-center"
              style={{ top: "15%", right: "5%", background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", gap: 8, zIndex: 5, minWidth: 140 }}
              animate={{ y: [0, -8, 0], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            >
              <span className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: "rgba(85,107,47,0.1)" }}>
                <Camera size={14} color="#556B2F" />
              </span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2d3a1c" }}>Photo uploaded!</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>by Guest #47</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}
