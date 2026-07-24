"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadSimple, Check, Camera, Image as ImageIcon } from "@phosphor-icons/react";
import { SectionHeader, Accent } from "./SectionHeader";

const ALBUM = [
  "/use-cases/wedding/album-couple.jpg",
  "/use-cases/wedding/album-ceremony.jpg",
  "/use-cases/wedding/album-bouquet.jpg",
  "/use-cases/wedding/album-sunset-dance.jpg",
  "/use-cases/wedding/album-tablescape.jpg",
  "/use-cases/wedding/album-cake.jpg",
];

const NOTIFS = [
  { name: "Emma R.", action: "uploaded 3 photos", time: "just now" },
  { name: "James K.", action: "uploaded a video", time: "2s ago" },
  { name: "Sophie M.", action: "uploaded 7 photos", time: "5s ago" },
  { name: "Oliver T.", action: "uploaded 2 photos", time: "8s ago" },
];

function QrGlyph() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden>
      <rect width="110" height="110" rx="10" fill="white" />
      {[[8, 8], [70, 8], [8, 70]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="32" height="32" rx="3" fill="#556B2F" />
          <rect x={x + 5} y={y + 5} width="22" height="22" rx="2" fill="white" />
          <rect x={x + 9} y={y + 9} width="14" height="14" rx="1" fill="#556B2F" />
        </g>
      ))}
      {[48, 54, 60, 66, 72, 78, 84, 90, 96].map((x, i) =>
        [8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98].filter((_, j) => (i * 3 + j * 2) % 5 !== 0).map((y, j) => (
          <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" rx="1" fill="#556B2F" opacity={0.75} />
        )),
      )}
    </svg>
  );
}

const CORNERS = [
  { top: -2, left: -2, borderTop: "3px solid #7a9640", borderLeft: "3px solid #7a9640", borderRadius: "4px 0 0 0" },
  { top: -2, right: -2, borderTop: "3px solid #7a9640", borderRight: "3px solid #7a9640", borderRadius: "0 4px 0 0" },
  { bottom: -2, left: -2, borderBottom: "3px solid #7a9640", borderLeft: "3px solid #7a9640", borderRadius: "0 0 0 4px" },
  { bottom: -2, right: -2, borderBottom: "3px solid #7a9640", borderRight: "3px solid #7a9640", borderRadius: "0 0 4px 0" },
];

export function DeviceShowcase() {
  const [visibleCount, setVisibleCount] = useState(4);
  const [notifIndex, setNotifIndex] = useState(0);
  const [showNotif, setShowNotif] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotif(false);
      setTimeout(() => {
        setVisibleCount((c) => Math.min(c + 1, ALBUM.length));
        setNotifIndex((i) => (i + 1) % NOTIFS.length);
        setShowNotif(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden" style={{ background: "#fff", padding: "100px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 72 }}>
          <SectionHeader badge="Live in action" title={<>Watch your album<br /><Accent>fill up in real time</Accent></>} />
        </div>

        <div className="grid items-center showcase-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          {/* Left: scanning phone */}
          <motion.div className="flex flex-col items-center" style={{ gap: 32 }} initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="text-center">
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "#2d3a1c", marginBottom: 12 }}>Guest scans, done.</h3>
              <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, maxWidth: 340 }}>
                Any smartphone camera instantly recognises the Momento App QR code and opens the upload page — no app
                needed.
              </p>
            </div>

            <div className="relative" style={{ width: 240, borderRadius: 36, background: "#1c1c2e", padding: 10, boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center justify-center" style={{ height: 20, background: "#1c1c2e", borderRadius: "36px 36px 0 0" }}>
                <div style={{ width: 50, height: 5, borderRadius: 3, background: "#333" }} />
              </div>
              <div className="overflow-hidden" style={{ borderRadius: 28, background: "#0d0d1a" }}>
                <div className="relative flex flex-col items-center justify-center" style={{ height: 340, background: "linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%)", padding: 20 }}>
                  <div className="relative" style={{ padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 16 }}>
                    <div className="absolute inset-0" style={{ borderRadius: 16, border: "1px solid rgba(85,107,47,0.4)" }} />
                    {CORNERS.map((s, i) => (
                      <div key={i} className="absolute" style={{ width: 20, height: 20, ...s }} />
                    ))}
                    <motion.div
                      className="absolute"
                      style={{ left: 8, right: 8, height: 2, background: "linear-gradient(90deg, transparent, #7a9640, transparent)", boxShadow: "0 0 8px #7a9640" }}
                      animate={{ top: ["8%", "88%", "8%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <QrGlyph />
                  </div>
                  <div className="text-center" style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Scanning QR Code...</div>
                </div>
                <div className="flex items-center justify-center" style={{ background: "#1c1c2e", height: 50, gap: 24 }}>
                  <Camera size={20} color="rgba(255,255,255,0.4)" />
                  <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.4)" }}>
                    <div className="rounded-full" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.8)" }} />
                  </div>
                  <ImageIcon size={20} color="rgba(255,255,255,0.4)" />
                </div>
              </div>
              <div className="flex items-center justify-center" style={{ height: 16 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "#444" }} />
              </div>
            </div>
          </motion.div>

          {/* Right: live album phone */}
          <motion.div className="flex flex-col items-center" style={{ gap: 32 }} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="text-center">
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "#2d3a1c", marginBottom: 12 }}>Your album, live.</h3>
              <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, maxWidth: 340 }}>
                Watch every photo appear in your album in real time. No refreshing, no waiting — pure magic.
              </p>
            </div>

            <div className="relative">
              <div style={{ width: 260, borderRadius: 36, background: "#1c1c2e", padding: 10, boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>
                <div className="flex items-center justify-center" style={{ height: 20, background: "#1c1c2e", borderRadius: "36px 36px 0 0" }}>
                  <div style={{ width: 50, height: 5, borderRadius: 3, background: "#333" }} />
                </div>
                <div className="overflow-hidden" style={{ borderRadius: 28, background: "#f8f4f0" }}>
                  <div className="flex items-center justify-between" style={{ background: "linear-gradient(135deg, #556B2F, #7a9640)", padding: "14px 16px" }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#fff" }}>Sarah &amp; James</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>{visibleCount * 2 + 142} photos · Live</div>
                    </div>
                    <div className="rounded-full" style={{ width: 8, height: 8, background: "#a3e635", boxShadow: "0 0 6px #a3e635" }} />
                  </div>

                  <div style={{ padding: 8 }}>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                      {ALBUM.slice(0, visibleCount).map((src, i) => (
                        <motion.div
                          key={i}
                          initial={i === visibleCount - 1 ? { opacity: 0, scale: 0.8 } : false}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{ aspectRatio: "1", borderRadius: 6, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                        />
                      ))}
                      {Array.from({ length: Math.max(0, 6 - visibleCount) }).map((_, i) => (
                        <div key={`sk-${i}`} className="qrw-pulse" style={{ aspectRatio: "1", borderRadius: 6, background: "#e5e7eb" }} />
                      ))}
                    </div>

                    <div className="flex items-center justify-between" style={{ marginTop: 10, background: "linear-gradient(135deg, #f4f9ee, #e8f5d8)", borderRadius: 10, padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, color: "#556B2F", fontWeight: 600 }}>Download all photos</span>
                      <Check size={13} color="#556B2F" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center" style={{ height: 16 }}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: "#444" }} />
                </div>
              </div>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    key={notifIndex}
                    className="absolute flex items-center"
                    style={{ top: -16, right: -20, background: "#fff", borderRadius: 14, padding: "10px 14px", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", gap: 10, minWidth: 180, border: "1px solid rgba(85,107,47,0.1)" }}
                    initial={{ opacity: 0, y: 12, x: 10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 30, height: 30, background: "linear-gradient(135deg, #556B2F, #7a9640)" }}>
                      <UploadSimple size={13} color="#fff" />
                    </span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#2d3a1c" }}>{NOTIFS[notifIndex].name}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{NOTIFS[notifIndex].action}</div>
                    </div>
                    <div style={{ fontSize: 9, color: "#d1d5db", marginLeft: "auto" }}>{NOTIFS[notifIndex].time}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .showcase-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }
        .qrw-pulse { animation: qrw-pulse 1.5s ease-in-out infinite; }
        @keyframes qrw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </section>
  );
}
